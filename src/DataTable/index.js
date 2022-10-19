import React, {useState, useEffect} from "react";
import axios from "axios";
import {Button, Popconfirm, Table, Space, Form, Input} from "antd";
import './index.css';
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const DataTable = () => {
    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editRowKey, setEditRowKey] = useState("");
    const [sortedInfo, setSortedInfo] = useState({});
    const [searchColText, setSearchColText] = useState("");
    const [searchedCol, setSearchedCol] = useState("");
    const [filteredInfo, setFilteredInfo] = useState({});
    const [form] = Form.useForm();
    let [filteredData] = useState();

    useEffect(() => {
        loadData();
    }, [])

    const loadData = async () => {
        setLoading(true);
        const response = await axios.get("https://jsonplaceholder.typicode.com/comments");
        setGridData(response.data);
        setLoading(false);
    };

    const dataWithAge = gridData.map((item) => ({
        ...item,
        age: Math.floor(Math.random() * 6) + 18

    }));

    const modifiedData = dataWithAge.map(({body, ...item}) => ({
        ...item,
        key: item.id,
    }));

    const handleDelete = (record) => {
        const dataSource = [...modifiedData];
        const filteredData = dataSource.filter((item) => item.id !== record.id);
        setGridData(filteredData);
    }

    const isEditing = (record) => {
        return record.key === editRowKey;
    }

    const cancel = () => {
        setEditRowKey("");
    };

    const save = () => {};

    const edit = (record) => {
       form.setFieldsValue({
           name: "",
           email: "",
           ...record
       });
       setEditRowKey(record.key);
    };

    const handleChange = (_, filter, sorter) => {
        const {order, field} = sorter;
        setFilteredInfo(filter);
        setSortedInfo({columnKey: field, order});
    };

    const getColumnSearch = (dataIndex) => ({
        filterDropDown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters
        }) => (
            <div style={{padding: "0"}}>
                <Input
                placeholder={"Enter Here"}
                value={selectedKeys[0]}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
                style={{width: "188", marginBottom: "0", display: "block"}}
                />
                <Space>
                    <Button
                        onClick={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{width: "90"}}
                        >
                        Search
                    </Button>
                    <Button
                        onClick={() => handleResetCol(clearFilters)}
                        size="small"
                        style={{width: "90"}}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{color: filtered ? "#1890ff" : undefined}} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]
                    .toString()
                    .toLowerCase()
                    .includes(value.toLowerCase())
                : "",
        render: (text) =>
            searchedCol === dataIndex ? (
                <Highlighter
                highlightStyle={{backgroundColor: "#ffc069", padding: 0}}
                searchWords={[searchColText]}
                autoEscape
                textToHighlight={text ? text.toString(): ""}
                />
            ): (
                text
            ),
    });

    const handleSearchCol = (selectedKeys, confirm, dataIndex) => {
      confirm();
      setSearchColText(selectedKeys[0]);
      setSearchedCol(dataIndex);
    };

    const handleResetCol = (clearFilters) => {
        clearFilters();
        setSearchColText("");
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
        },
        {
            title: "Name",
            dataIndex: "name",
            align: "center",
            editTable: true,
            sorter: (a,b) => a.name.length - b.name.length,
            sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
            ...getColumnSearch("name"),
        },
        {
            title: "E-mail",
            dataIndex: "email",
            align: "center",
            editTable: true,
            sorter: (a,b) => a.email.length - b.email.length,
            sortOrder: sortedInfo.columnKey === "email" && sortedInfo.order,
            ...getColumnSearch("email"),
        },
        {
            title: "Age",
            dataIndex: "age",
            align: "center",
            editTable: false,
            sorter: (a,b) => a.age - b.age,
            sortOrder: sortedInfo.columnKey === "age" && sortedInfo.order,
            filters: [
                {text: "18", value: "18"},
                {text: "19", value: "19"},
                {text: "20", value: "20"},
                {text: "21", value: "21"},
                {text: "22", value: "22"},
                {text: "23", value: "23"},
            ],
            filteredValue: filteredInfo.age || null,
            onFilter: (value, record) => String(record.age).includes(value),
        },
        {
            title: "",
            dataIndex: "action",
            align: "center",
            render: (_, record) => {
                const editable = isEditing(record);
                return modifiedData.length >= 1 ? (
                    <Space>
                        <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record)}>
                            <Button type="text" style={{color: "black"}} hidden={editable}>Delete</Button>
                        </Popconfirm>
                        {editable ? (
                            <span>
                                <Space size={"middle"}>
                                    <Button onClick={save}>Save</Button>
                                    <Button onClick={cancel}>Cancel</Button>
                                </Space>
                            </span>
                        ): (
                            <Button onClick={() => edit(record)} type="text" style={{color: "black"}}>Edit</Button>
                        )}
                    </Space>
                ) : null;
            }
        },
    ];

    const newColumns = columns.map((column) => {
        if (!column.editTable) {
            return column;
        }

        return {
            ...column,
            onCell: (record) => ({
                record,
                dataIndex: column.dataIndex,
                title: column.title,
                editing: isEditing(record),
            }),
        };
    })

    const editableCell = ({editing, dataIndex, record, children, ...restProps}) => {
        const input = <Input />

        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item name={dataIndex} style={{margin: "0"}} rules={[{
                        required: true,
                        message: 'please input value'
                    }]}>
                        {input}
                    </Form.Item>
                ): (
                    children
                )}
            </td>
        );
    };

    return (
        <div>
            <Form form={form} component={false}>
                <Table
                    columns={newColumns}
                    components={{
                        body: {
                            cell: editableCell,
                        },
                    }}
                    dataSource={filteredData && filteredData.length ? filteredData : modifiedData}
                    bordered={true}
                    loading={loading}
                    onChange={handleChange}
                />
            </Form>
        </div>
    );
};

export default DataTable