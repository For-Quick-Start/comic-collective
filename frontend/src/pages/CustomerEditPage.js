import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeLayout from '../components/EmployeeLayout';

function CustomerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <EmployeeLayout title="Edit Customer">
      <div>
        <h1>Edit Customer {id}</h1>
        <p>This is where you would edit customer details.</p>
        <button onClick={() => navigate('/cust')}>Back to Customer List</button>
      </div>
    </EmployeeLayout>
  );
}

export default CustomerEditPage;