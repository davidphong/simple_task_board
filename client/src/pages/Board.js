import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiLogOut, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';

// Define task status colors
const STATUS_COLORS = {
  'In Progress': '#4a6de5',
  'Completed': '#2ecc71',
  'Won\'t do': '#e74c3c'
};

const Board = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const { logout, user } = useAuthStore();
  const { 
    board, 
    boards,
    tasks, 
    isLoading, 
    error, 
    getBoard,
    getAllBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    createTask,
  } = useBoardStore();
  
  const [newTaskForm, setNewTaskForm] = useState({
    isOpen: false,
    name: '',
    description: '',
    status: 'In Progress'
  });
  
  const [newBoardForm, setNewBoardForm] = useState({
    isOpen: false,
    name: '',
    description: ''
  });
  
  const [editBoardForm, setEditBoardForm] = useState({
    isOpen: false,
    id: '',
    name: '',
    description: ''
  });
  
  // Load boards and board data on mount or when boardId changes
  useEffect(() => {
    const fetchData = async () => {
      // Fetch all boards
      await getAllBoards();
      
      // Get current boards list
      const currentBoards = useBoardStore.getState().boards;
      
      // If there are no boards, create a default one
      if (currentBoards.length === 0) {
        const newBoardId = await createBoard('My First Board', 'My task collection');
        if (newBoardId) {
          navigate(`/board/${newBoardId}`);
        }
      } 
      // If there are boards but no boardId is specified, navigate to the first board
      else if (!boardId && currentBoards.length > 0) {
        navigate(`/board/${currentBoards[0].id}`);
      } 
      // If a boardId is specified, load that board
      else if (boardId) {
        await getBoard(boardId);
      }
    };
    
    fetchData();
  }, [boardId, createBoard, getBoard, getAllBoards, navigate]);
  
  // Group tasks by status
  const tasksByStatus = {
    'In Progress': tasks.filter(task => task.status === 'In Progress'),
    'Completed': tasks.filter(task => task.status === 'Completed'),
    'Won\'t do': tasks.filter(task => task.status === "Won't do")
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleNewTaskForm = () => {
    setNewTaskForm(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };
  
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTaskForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();
    
    if (newTaskForm.name.trim()) {
      await createTask(
        newTaskForm.name,
        newTaskForm.description,
        newTaskForm.status,
        '',
        boardId
      );
      
      setNewTaskForm({
        isOpen: false,
        name: '',
        description: '',
        status: 'In Progress'
      });
    }
  };
  
  const toggleNewBoardForm = () => {
    setNewBoardForm(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };
  
  const handleNewBoardChange = (e) => {
    const { name, value } = e.target;
    setNewBoardForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewBoardSubmit = async (e) => {
    e.preventDefault();
    
    if (newBoardForm.name.trim()) {
      const newBoardId = await createBoard(newBoardForm.name, newBoardForm.description);
      
      if (newBoardId) {
        navigate(`/board/${newBoardId}`);
        setNewBoardForm({
          isOpen: false,
          name: '',
          description: ''
        });
      }
    }
  };
  
  const handleEditBoard = (boardToEdit) => {
    setEditBoardForm({
      isOpen: true,
      id: boardToEdit.id,
      name: boardToEdit.name,
      description: boardToEdit.description || ''
    });
  };
  
  const handleEditBoardChange = (e) => {
    const { name, value } = e.target;
    setEditBoardForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditBoardSubmit = async (e) => {
    e.preventDefault();
    
    if (editBoardForm.name.trim()) {
      const success = await updateBoard(
        editBoardForm.id,
        editBoardForm.name,
        editBoardForm.description
      );
      
      if (success) {
        setEditBoardForm({
          isOpen: false,
          id: '',
          name: '',
          description: ''
        });
      }
    }
  };
  
  const handleDeleteBoard = async (boardId) => {
    if (window.confirm('Are you sure you want to delete this board? All tasks will be deleted.')) {
      const success = await deleteBoard(boardId);
      if (success && boards.length > 0) {
        // Navigate to another board if available
        const otherBoard = boards.find(b => b.id !== boardId);
        if (otherBoard) {
          navigate(`/board/${otherBoard.id}`);
        } else {
          navigate('/');
        }
      }
    }
  };
  
  return (
    <BoardContainer>
      <Header>
        <Logo>Task Board</Logo>
        <UserSection>
          {user && <UserName>Hello, {user.username}</UserName>}
          <IconButton onClick={handleLogout}>
            <FiLogOut size={20} />
          </IconButton>
        </UserSection>
      </Header>
      
      <Content>
        <Sidebar>
          <SidebarHeader>
            <h3>My Boards</h3>
            <IconButton onClick={toggleNewBoardForm}>
              <FiPlus size={18} />
            </IconButton>
          </SidebarHeader>
          
          {newBoardForm.isOpen && (
            <NewBoardForm onSubmit={handleNewBoardSubmit}>
              <Input
                type="text"
                name="name"
                value={newBoardForm.name}
                onChange={handleNewBoardChange}
                placeholder="Board name"
                required
              />
              <Textarea
                name="description"
                value={newBoardForm.description}
                onChange={handleNewBoardChange}
                placeholder="Board description (optional)"
              />
              <ButtonGroup>
                <StyledButton type="submit">Create</StyledButton>
                <StyledButton type="button" secondary onClick={toggleNewBoardForm}>
                  Cancel
                </StyledButton>
              </ButtonGroup>
            </NewBoardForm>
          )}
          
          {editBoardForm.isOpen && (
            <NewBoardForm onSubmit={handleEditBoardSubmit}>
              <Input
                type="text"
                name="name"
                value={editBoardForm.name}
                onChange={handleEditBoardChange}
                placeholder="Board name"
                required
              />
              <Textarea
                name="description"
                value={editBoardForm.description}
                onChange={handleEditBoardChange}
                placeholder="Board description (optional)"
              />
              <ButtonGroup>
                <StyledButton type="submit">Update</StyledButton>
                <StyledButton type="button" secondary onClick={() => setEditBoardForm({ ...editBoardForm, isOpen: false })}>
                  Cancel
                </StyledButton>
              </ButtonGroup>
            </NewBoardForm>
          )}
          
          <BoardsList>
            {boards.map(b => (
              <BoardItem 
                key={b.id}
                active={board && b.id === board.id}
                onClick={() => navigate(`/board/${b.id}`)}
              >
                <BoardItemContent>
                  <BoardItemName>{b.name}</BoardItemName>
                  <BoardItemActions>
                    <BoardActionButton onClick={(e) => { 
                      e.stopPropagation(); 
                      handleEditBoard(b);
                    }}>
                      <FiEdit2 size={14} />
                    </BoardActionButton>
                    <BoardActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(b.id);
                    }}>
                      <FiTrash2 size={14} />
                    </BoardActionButton>
                  </BoardItemActions>
                </BoardItemContent>
              </BoardItem>
            ))}
          </BoardsList>
        </Sidebar>
        
        <MainContent>
          {isLoading ? (
            <Loading>Loading...</Loading>
          ) : error ? (
            <Error>{error}</Error>
          ) : board ? (
            <>
              <BoardHeader>
                <div>
                  <BoardTitle>{board.name}</BoardTitle>
                  <BoardDescription>{board.description}</BoardDescription>
                </div>
                <ActionButtons>
                  <Button 
                    variant="primary" 
                    size="small" 
                    onClick={toggleNewTaskForm}
                  >
                    <FiPlus size={16} style={{ marginRight: '0.25rem' }} />
                    Add Task
                  </Button>
                </ActionButtons>
              </BoardHeader>
              
              {newTaskForm.isOpen && (
                <NewTaskForm onSubmit={handleNewTaskSubmit}>
                  <Input
                    type="text"
                    name="name"
                    value={newTaskForm.name}
                    onChange={handleNewTaskChange}
                    placeholder="Task name"
                    required
                  />
                  <Textarea
                    name="description"
                    value={newTaskForm.description}
                    onChange={handleNewTaskChange}
                    placeholder="Task description (optional)"
                  />
                  <Select
                    name="status"
                    value={newTaskForm.status}
                    onChange={handleNewTaskChange}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Won't do">Won't do</option>
                  </Select>
                  <ButtonGroup>
                    <StyledButton type="submit">Add Task</StyledButton>
                    <StyledButton type="button" secondary onClick={toggleNewTaskForm}>
                      Cancel
                    </StyledButton>
                  </ButtonGroup>
                </NewTaskForm>
              )}
              
              <TaskColumnsContainer>
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                  <TaskColumn key={status} status={status}>
                    <ColumnHeader status={status}>
                      <ColumnTitle>{status}</ColumnTitle>
                      <TaskCount>{statusTasks.length}</TaskCount>
                    </ColumnHeader>
                    
                    <TaskList>
                      {statusTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      
                      {statusTasks.length === 0 && (
                        <EmptyState>No tasks in this column</EmptyState>
                      )}
                    </TaskList>
                  </TaskColumn>
                ))}
              </TaskColumnsContainer>
            </>
          ) : (
            <NoBoard>
              <h3>No board selected</h3>
              <p>Create a new board to get started</p>
              <Button 
                variant="primary" 
                onClick={toggleNewBoardForm}
              >
                Create Board
              </Button>
            </NoBoard>
          )}
        </MainContent>
      </Content>
    </BoardContainer>
  );
};

// Styled components
const BoardContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1rem 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dark-color);
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: white;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem 1rem;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--dark-color);
  }
`;

const BoardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BoardItem = styled.div`
  padding: 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  background-color: ${props => props.active ? 'rgba(94, 114, 228, 0.1)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--dark-color)'};
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(94, 114, 228, 0.1)' : '#f8fafc'};
  }
`;

const BoardItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BoardItemName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BoardItemActions = styled.div`
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${BoardItem}:hover & {
    opacity: 1;
  }
`;

const BoardActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #f8fafc;
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BoardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
`;

const BoardDescription = styled.p`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TaskColumnsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
`;

const TaskColumn = styled.div`
  background-color: #f1f5f9;
  border-radius: var(--border-radius);
  padding: 1rem;
  border-top: 3px solid ${props => STATUS_COLORS[props.status] || '#cbd5e1'};
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ColumnTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark-color);
`;

const TaskCount = styled.span`
  font-size: 0.75rem;
  background-color: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  color: var(--dark-color);
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--secondary-color);
  font-size: 0.875rem;
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px dashed #e2e8f0;
`;

const NewTaskForm = styled.form`
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
`;

const NewBoardForm = styled.form`
  background-color: #f8fafc;
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StyledButton = styled.button`
  padding: 0.625rem 1rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  background-color: ${props => props.secondary ? '#f1f5f9' : 'var(--primary-color)'};
  color: ${props => props.secondary ? 'var(--dark-color)' : 'white'};
  
  &:hover {
    background-color: ${props => props.secondary ? '#e2e8f0' : '#4a5cd0'};
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.25rem;
  color: var(--secondary-color);
`;

const Error = styled.div`
  background-color: #fef2f2;
  color: var(--danger-color);
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
`;

const NoBoard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  gap: 1rem;
  text-align: center;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--dark-color);
  }
  
  p {
    color: var(--secondary-color);
    margin-bottom: 1rem;
  }
`;

export default Board; 