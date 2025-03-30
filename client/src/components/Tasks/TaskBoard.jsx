import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import {
    GET_ORDER_TASKS,
    CREATE_TASK,
    UPDATE_TASK,
    DELETE_TASK
} from '../../utils/constants';
import { useStateProvider } from '../../context/StateContext';
import { FaPlus, FaTimes, FaCalendarAlt, FaUser, FaTrashAlt, FaPencilAlt, FaGripVertical } from 'react-icons/fa';
import { toast } from 'react-toastify';

// A simpler implementation that uses standard DOM manipulation
// This ensures compatibility across browsers
const TaskBoard = ({ orderId, sellerId, buyerId, isUserSeller, initialTasks = [], isLoading = false, refreshTasks }) => {
    const [tasks, setTasks] = useState(initialTasks);
    const [loading, setLoading] = useState(isLoading);
    const [columns, setColumns] = useState({
        TODO: {
            id: 'TODO',
            title: 'To Do',
            taskIds: []
        },
        IN_PROGRESS: {
            id: 'IN_PROGRESS',
            title: 'In Progress',
            taskIds: []
        },
        COMPLETED: {
            id: 'COMPLETED',
            title: 'Completed',
            taskIds: []
        }
    });
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        assignedToId: sellerId // Default to seller
    });
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [{ userInfo }] = useStateProvider();

    // Load tasks from the API if initialTasks isn't provided
    const loadTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${GET_ORDER_TASKS}/${orderId}`, {
                withCredentials: true
            });

            const fetchedTasks = response.data.tasks || [];
            console.log('Fetched tasks:', fetchedTasks);
            console.log('Current user info:', userInfo);
            console.log('Is user seller:', isUserSeller);
            console.log('Seller ID:', sellerId);
            console.log('Buyer ID:', buyerId);

            setTasks(fetchedTasks);

            // Distribute tasks into columns
            const newColumns = {
                TODO: { ...columns.TODO, taskIds: [] },
                IN_PROGRESS: { ...columns.IN_PROGRESS, taskIds: [] },
                COMPLETED: { ...columns.COMPLETED, taskIds: [] }
            };

            fetchedTasks.forEach(task => {
                if (task.status === 'TODO') {
                    newColumns.TODO.taskIds.push(task.id);
                } else if (task.status === 'IN_PROGRESS') {
                    newColumns.IN_PROGRESS.taskIds.push(task.id);
                } else if (task.status === 'COMPLETED') {
                    newColumns.COMPLETED.taskIds.push(task.id);
                }
            });

            setColumns(newColumns);
        } catch (error) {
            console.error('Error loading tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    // When initialTasks changes, update our local state
    useEffect(() => {
        if (initialTasks && initialTasks.length > 0) {
            setTasks(initialTasks);

            // Distribute tasks into columns
            const newColumns = {
                TODO: { ...columns.TODO, taskIds: [] },
                IN_PROGRESS: { ...columns.IN_PROGRESS, taskIds: [] },
                COMPLETED: { ...columns.COMPLETED, taskIds: [] }
            };

            initialTasks.forEach(task => {
                if (task.status === 'TODO') {
                    newColumns.TODO.taskIds.push(task.id);
                } else if (task.status === 'IN_PROGRESS') {
                    newColumns.IN_PROGRESS.taskIds.push(task.id);
                } else if (task.status === 'COMPLETED') {
                    newColumns.COMPLETED.taskIds.push(task.id);
                }
            });

            setColumns(newColumns);
            setLoading(isLoading);
        } else if (orderId && !initialTasks.length) {
            // Only load tasks if no initialTasks provided
            loadTasks();
        }
    }, [initialTasks, isLoading, orderId]);

    // Function to handle moving a task to a different status
    const moveTask = async (taskId, newStatus) => {
        // Find the task
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Check if user is allowed to move this task
        if (!isUserSeller && task.assignedToId !== userInfo.id) {
            toast.error('You can only update tasks assigned to you');
            return;
        }

        // Get the current status
        const currentStatus = task.status;

        // Don't do anything if status didn't change
        if (currentStatus === newStatus) return;

        // Create new columns state by removing task from old column and adding to new column
        const newColumns = { ...columns };
        newColumns[currentStatus].taskIds = newColumns[currentStatus].taskIds.filter(id => id !== taskId);
        newColumns[newStatus].taskIds.push(taskId);

        // Update local state first for responsive UI
        setColumns(newColumns);

        try {
            // Update the task status in the API
            await axios.put(`${UPDATE_TASK}/${taskId}`,
                { status: newStatus },
                { withCredentials: true }
            );

            // Update the task in local state
            setTasks(prevTasks =>
                prevTasks.map(t =>
                    t.id === taskId ? { ...t, status: newStatus } : t
                )
            );

            toast.success('Task status updated');

            // Refresh tasks to update all components
            if (typeof refreshTasks === 'function') {
                refreshTasks();
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Failed to update task status');
            // Revert to the previous state on error
            loadTasks();
        }
    };

    // Handle task form submission
    const handleTaskSubmit = async (e) => {
        e.preventDefault();

        if (!taskFormData.title.trim()) {
            toast.error('Task title is required');
            return;
        }

        try {
            if (editingTaskId) {
                // Update existing task
                const response = await axios.put(
                    `${UPDATE_TASK}/${editingTaskId}`,
                    taskFormData,
                    { withCredentials: true }
                );

                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === editingTaskId ? response.data.task : task
                    )
                );

                toast.success('Task updated successfully');
            } else {
                // Create new task
                const response = await axios.post(
                    `${CREATE_TASK}/${orderId}`,
                    taskFormData,
                    { withCredentials: true }
                );

                // Add the new task to state
                setTasks(prevTasks => [response.data.task, ...prevTasks]);

                // Add the new task to the TODO column
                setColumns(prevColumns => ({
                    ...prevColumns,
                    TODO: {
                        ...prevColumns.TODO,
                        taskIds: [response.data.task.id, ...prevColumns.TODO.taskIds]
                    }
                }));

                toast.success(isUserSeller ? 'Task created successfully' : 'Task suggestion submitted');
            }

            // Reset form
            setTaskFormData({
                title: '',
                description: '',
                deadline: '',
                assignedToId: sellerId
            });
            setShowTaskForm(false);
            setEditingTaskId(null);

            // Refresh tasks to update all components
            if (typeof refreshTasks === 'function') {
                refreshTasks();
            }
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Failed to save task');
        }
    };

    // Handle task deletion
    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await axios.delete(`${DELETE_TASK}/${taskId}`, { withCredentials: true });

            // Remove task from state
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

            // Remove task from columns
            const newColumns = { ...columns };
            Object.keys(newColumns).forEach(columnId => {
                newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(id => id !== taskId);
            });
            setColumns(newColumns);

            toast.success('Task deleted successfully');

            // Refresh tasks to update all components
            if (typeof refreshTasks === 'function') {
                refreshTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    // Handle task approval (for seller to approve buyer's suggestions)
    const handleApproveTask = async (taskId) => {
        try {
            const response = await axios.put(`${UPDATE_TASK}/${taskId}`,
                { isApproved: true },
                { withCredentials: true }
            );

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, isApproved: true } : task
                )
            );

            toast.success('Task approved');
        } catch (error) {
            console.error('Error approving task:', error);
            toast.error('Failed to approve task');
        }
    };

    // Handle task editing
    const handleEditTask = (task) => {
        setTaskFormData({
            title: task.title,
            description: task.description || '',
            deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
            assignedToId: task.assignedToId
        });
        setEditingTaskId(task.id);
        setShowTaskForm(true);
    };

    // Function to find a task by ID
    const getTaskById = (taskId) => tasks.find(task => task.id === taskId);

    // Render task form
    const renderTaskForm = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">
                            {editingTaskId ? 'Edit Task' : isUserSeller ? 'Create Task' : 'Suggest Task'}
                        </h3>
                        <button
                            onClick={() => {
                                setShowTaskForm(false);
                                setEditingTaskId(null);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleTaskSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={taskFormData.title}
                                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                placeholder="Task title"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Description</label>
                            <textarea
                                value={taskFormData.description}
                                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                                className="w-full p-2 border rounded-md min-h-[100px]"
                                placeholder="Task description"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Deadline</label>
                            <input
                                type="date"
                                value={taskFormData.deadline}
                                onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        {isUserSeller && (
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Assign To</label>
                                <select
                                    value={taskFormData.assignedToId}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedToId: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value={sellerId}>Me (Seller)</option>
                                    <option value={buyerId}>Buyer</option>
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTaskForm(false);
                                    setEditingTaskId(null);
                                }}
                                className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                                {editingTaskId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Render the task card
    const renderTaskCard = (task) => {
        return (
            <div
                key={task.id}
                className={`bg-white p-3 rounded-md mb-2 shadow-sm hover:shadow transition-all duration-200 
                    ${task.isSuggestion && !task.isApproved ? 'border-l-4 border-yellow-400' : ''}`}
            >
                <div className="flex justify-between items-start">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex">
                        {(isUserSeller || task.createdById === userInfo.id) && (
                            <>
                                <button
                                    onClick={() => handleEditTask(task)}
                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                >
                                    <FaPencilAlt />
                                </button>
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTrashAlt />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {task.description && (
                    <p className="text-gray-600 text-sm mt-1 mb-2">
                        {task.description.length > 100
                            ? `${task.description.substring(0, 100)}...`
                            : task.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500">
                    {task.deadline && (
                        <div className="flex items-center mr-3">
                            <FaCalendarAlt className="mr-1" />
                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                    )}

                    <div className="flex items-center">
                        <FaUser className="mr-1" />
                        <span>{task.assignedTo?.username}</span>
                    </div>
                </div>

                {/* Show creator info */}
                <div className="text-xs text-gray-500 mt-1">
                    Created by: {task.createdById === sellerId ? 'Seller' : 'Buyer'}
                </div>

                {/* Task suggestion approval (seller only) */}
                {isUserSeller && task.isSuggestion && !task.isApproved && (
                    <div className="mt-2 pt-2 border-t">
                        <div className="text-xs text-yellow-600 mb-1">Suggested by Buyer</div>
                        <button
                            onClick={() => handleApproveTask(task.id)}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        >
                            Approve Task
                        </button>
                    </div>
                )}

                {/* Move buttons */}
                <div className="mt-3 pt-2 border-t flex justify-between">
                    {task.status !== 'TODO' && (
                        <button
                            onClick={() => moveTask(task.id, 'TODO')}
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                            Move to To Do
                        </button>
                    )}

                    {task.status !== 'IN_PROGRESS' && (
                        <button
                            onClick={() => moveTask(task.id, 'IN_PROGRESS')}
                            className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                        >
                            Move to In Progress
                        </button>
                    )}

                    {task.status !== 'COMPLETED' && (
                        <button
                            onClick={() => moveTask(task.id, 'COMPLETED')}
                            className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
                        >
                            Move to Completed
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Render the kanban board
    return (
        <div className="bg-white rounded-lg p-6 shadow-md mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Kanban Board</h2>
                <button
                    onClick={() => setShowTaskForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                    <FaPlus className="mr-2" />
                    {isUserSeller ? 'Add Task' : 'Suggest Task'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(columns).map(column => (
                        <div key={column.id} className="bg-gray-100 rounded-md p-3">
                            <h3 className="font-semibold text-lg mb-3 text-gray-700">{column.title}</h3>

                            <div className="min-h-[200px]">
                                {column.taskIds.map(taskId => {
                                    const task = getTaskById(taskId);
                                    if (!task) return null;

                                    // For sellers: show all tasks
                                    // For buyers: only show approved tasks or tasks they created
                                    if (!isUserSeller && !task.isApproved && task.createdById !== userInfo.id) {
                                        console.log('Hiding task from buyer:', task);
                                        return null;
                                    }

                                    console.log('Rendering task:', task, 'for user:', isUserSeller ? 'Seller' : 'Buyer');
                                    return renderTaskCard(task);
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showTaskForm && renderTaskForm()}
        </div>
    );
};

export default TaskBoard; 