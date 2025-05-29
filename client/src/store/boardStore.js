import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper to get token for authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const useBoardStore = create((set, get) => ({
  board: null,
  boards: [],
  tasks: [],
  isLoading: false,
  error: null,
  
  // Get all boards for the user
  getAllBoards: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(
        `${API_URL}/boards`, 
        getAuthHeader()
      );
      
      set({ 
        boards: response.data.boards || [], 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch boards', 
        isLoading: false 
      });
      
      return false;
    }
  },

  // Create a new board
  createBoard: async (name, description = '') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(
        `${API_URL}/boards`, 
        { name, description }, 
        getAuthHeader()
      );
      
      // Update the boards list with the new board
      const newBoard = {
        id: response.data.board_id,
        name,
        description
      };
      
      set(state => ({
        boards: [...state.boards, newBoard],
        isLoading: false
      }));
      
      return response.data.board_id;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create board', 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Get board by ID
  getBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(
        `${API_URL}/boards/${boardId}`, 
        getAuthHeader()
      );
      
      set({ 
        board: response.data.board, 
        tasks: response.data.tasks, 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch board', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  // Update board details
  updateBoard: async (boardId, name, description) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.put(
        `${API_URL}/boards/${boardId}`, 
        { name, description }, 
        getAuthHeader()
      );
      
      set(state => ({
        board: { ...state.board, name, description },
        boards: state.boards.map(board => 
          board.id === boardId ? { ...board, name, description } : board
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update board', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  // Delete a board
  deleteBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(
        `${API_URL}/boards/${boardId}`, 
        getAuthHeader()
      );
      
      set(state => ({
        boards: state.boards.filter(board => board.id !== boardId),
        board: state.board?.id === boardId ? null : state.board,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete board', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  // Create a new task
  createTask: async (name, description = '', status = 'In Progress', icon = '', boardId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(
        `${API_URL}/tasks`, 
        { name, description, status, icon, board_id: boardId }, 
        getAuthHeader()
      );
      
      const newTask = {
        id: response.data.task_id,
        name,
        description,
        status,
        icon
      };
      
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create task', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  // Update a task
  updateTask: async (taskId, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.put(
        `${API_URL}/tasks/${taskId}`, 
        updates, 
        getAuthHeader()
      );
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update task', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  // Delete a task
  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(
        `${API_URL}/tasks/${taskId}`, 
        getAuthHeader()
      );
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete task', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  // Clear any error
  clearError: () => set({ error: null })
})); 