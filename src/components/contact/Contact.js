
'use client';
import React from 'react';

import { useState } from 'react';
import Form from 'next/form'

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState(null); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("not much happening now");
        setStatus(null); // Reset status before submission
    }
    return (
        <div className="bg-white p-6">
            <div className="inner-section">
            <Form onSubmit={handleSubmit}>
                <div>
                    <lable htmlFor="name"></lable>
                    <input 
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder='Full Name'
                        className="border rounded w-full py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-5"
                        required
                    />
                </div>
                <div>
                    <lable htmlFor="email"></lable>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder='Email Address'
                        className="border rounded w-full py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div>
                    <lable htmlFor="message"></lable>
                    <input 
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button className="border rounded p-3 bg-[#f9ccdf] text-gray-700" type="button">SEND</button>
            </Form>
            </div>
            

        </div>
    )
}

export default Contact;