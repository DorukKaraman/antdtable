import React, {useState, useEffect} from "react";
import axios from "axios";
import {Button, Popconfirm, Table} from "antd";
import './index.css';

const DataTable = () => {
    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const handleDelete = (value) => {
        const dataSource = [...modifiedData];
        const filteredData = dataSource.filter((item) => item.id !== value.id);
        setGridData(filteredData);
    }

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
        },
        {
            title: "Name",
            dataIndex: "name",
            align: "center",
            editTable: true
        },
        {
            title: "Age",
            dataIndex: "age",
            align: "center",
            editTable: false
        },
        {
            title: "",
            dataIndex: "action",
            align: "center",
            render: (_, record) =>
            modifiedData.length >= 1 ? (
                <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record)}>
                    <Button type="text" style={{color: "black"}}>Delete</Button>
                </Popconfirm>
            ): null,
        },
    ];

    return (
        <div>
            <Table
            columns={columns}
            dataSource={modifiedData}
            bordered={true}
            loading={loading}
            />
        </div>
    );
};

export default DataTable