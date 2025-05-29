import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { useBoardStore } from '../store/boardStore';

// Define task status colors
const STATUS_COLORS = {
  'In Progress': '#4a6de5',
  'Completed': '#2ecc71',
  'Won\'t do': '#e74c3c'
};

const TaskCard = ({ task }) => {
  const { updateTask, deleteTask } = useBoardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <FiCheckCircle color={STATUS_COLORS['Completed']} />;
      case 'Won\'t do':
        return <FiXCircle color={STATUS_COLORS['Won\'t do']} />;
      case 'In Progress':
      default:
        return <FiClock color={STATUS_COLORS['In Progress']} />;
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedTask({ ...task });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    const success = await updateTask(task.id, editedTask);
    if (success) {
      setIsEditing(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };
  
  return (
    <Card status={task.status}>
      {isEditing ? (
        <EditForm>
          <Input
            type="text"
            name="name"
            value={editedTask.name}
            onChange={handleChange}
            placeholder="Task name"
          />
          <Textarea
            name="description"
            value={editedTask.description}
            onChange={handleChange}
            placeholder="Task description"
          />
          <Select
            name="status"
            value={editedTask.status}
            onChange={handleChange}
          >
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Won't do">Won't do</option>
          </Select>
          <ButtonGroup>
            <Button type="button" onClick={handleSave}>Save</Button>
            <Button type="button" onClick={handleCancel} secondary>Cancel</Button>
          </ButtonGroup>
        </EditForm>
      ) : (
        <>
          <CardHeader>
            <TaskTitle>{task.name}</TaskTitle>
            <ActionButtons>
              <ActionButton onClick={handleEdit}>
                <FiEdit2 size={16} />
              </ActionButton>
              <ActionButton onClick={handleDelete}>
                <FiTrash2 size={16} />
              </ActionButton>
            </ActionButtons>
          </CardHeader>
          <Description>{task.description}</Description>
          <StatusBadge status={task.status}>
            {getStatusIcon(task.status)}
            <StatusText>{task.status}</StatusText>
          </StatusBadge>
        </>
      )}
    </Card>
  );
};

const Card = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s;
  border-left: 3px solid ${props => STATUS_COLORS[props.status] || '#cbd5e1'};
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark-color);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary-color);
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: ${props => `${STATUS_COLORS[props.status]}15`}; /* 15% opacity */
  color: ${props => STATUS_COLORS[props.status]};
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Textarea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background-color: ${props => props.secondary ? '#f1f5f9' : 'var(--primary-color)'};
  color: ${props => props.secondary ? 'var(--dark-color)' : 'white'};
  
  &:hover {
    background-color: ${props => props.secondary ? '#e2e8f0' : '#4a5cd0'};
  }
`;

export default TaskCard; 