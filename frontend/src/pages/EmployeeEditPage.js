import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeLayout from '../components/EmployeeLayout';

function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <EmployeeLayout title="Edit Customer">
      <div>
        <h1>Edit Employee {id}</h1>
        <p>This is where you would edit employee details.</p>
        <button onClick={() => navigate('/empl')}>Back to Employee List</button>
      </div>
    </EmployeeLayout>
  );
}

export default EmployeeEditPage;