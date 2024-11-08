import React, { useEffect, useState } from 'react';

const AdminOrder = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Fetch existing orders - Replace with actual API endpoint if available
        fetch('http://192.168.100.3:3000/api/orders')
            .then(response => response.json())
            .then(data => setOrders(data))
            .catch(error => console.error('Error fetching orders:', error));

        // Establish WebSocket connection
        const socket = new WebSocket('ws://192.168.100.3:3000');
        setWs(socket);

        socket.onopen = () => {
            console.log("Connected to WebSocket server");
        };
    
        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    
        socket.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
        };

        return () => {
            socket.close();
        };
    }, []);

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setStatus(order.status);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const updateOrderStatus = () => {
        if (!selectedOrder) return;

        const updateMessage = {
            type: 'updateOrder',
            orderId: selectedOrder.orderId,
            status
        };

        // Send update message via WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(updateMessage));
            // Update the selected order locally as well
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderId === selectedOrder.orderId
                        ? { ...order, status }
                        : order
                )
            );
        }
    };

    return (
        <div>
            <h1>Admin Order Management</h1>
            <div>
                <h2>Orders</h2>
                <ul>
                    {orders.map(order => (
                        <li
                            key={order.orderId}
                            onClick={() => handleOrderSelect(order)}
                            style={{
                                cursor: 'pointer',
                                color: selectedOrder?.orderId === order.orderId ? 'blue' : 'black'
                            }}
                        >
                            Order {order.orderId} - Status: {order.status}
                        </li>
                    ))}
                </ul>
            </div>
            {selectedOrder && (
                <div>
                    <h2>Update Order {selectedOrder.orderId}</h2>
                    <label>
                        Status:
                        <select value={status} onChange={handleStatusChange}>
                            <option value="pending">Pending</option>
                            <option value="cooking">Cooking</option>
                            <option value="packing">Packing</option>
                            <option value="delivering">Delivering</option>
                            <option value="delivered">Delivered</option>
                        </select>
                    </label>
                    <button onClick={updateOrderStatus}>Update Status</button>
                </div>
            )}
        </div>
    );
};

export default AdminOrder;
