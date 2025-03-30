import React, { useState, useEffect } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import axios from 'axios';
import { CREATE_TASK } from '../../utils/constants';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes } from 'react-icons/fa';

// Custom styling for Gantt chart
const ganttStyles = {
    wrapper: {
        '.gantt-table-header': {
            backgroundColor: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            fontWeight: 600
        },
        '.gantt-task-row-label': {
            fontWeight: 500,
            padding: '10px 12px'
        },
        '.calendar-header-text': {
            fontWeight: 500,
            color: '#475569'
        },
        '.bar-wrapper': {
            transition: 'transform 0.2s ease-in-out'
        },
        '.bar-wrapper:hover': {
            transform: 'translateY(-2px)',
            filter: 'brightness(0.95)'
        },
        '.vertical-line.today-line': {
            width: '2px',
            backgroundColor: 'rgba(239, 68, 68, 0.7)'
        },
        '.grid-cell, .grid-row': {
            borderColor: '#e2e8f0'
        },
        '.grid-cell.grid-weekend': {
            backgroundColor: '#f8fafc'
        },
        '.gantt-task-row:nth-child(even)': {
            backgroundColor: '#fafafa'
        },
        '.gantt-task-lists': {
            boxShadow: '2px 0px 7px rgba(0, 0, 0, 0.07)',
            zIndex: 2
        },
        '.bar-progress': {
            filter: 'brightness(0.95)'
        }
    }
};

const GanttChart = ({ tasks, orderId, sellerId, buyerId, isUserSeller, refreshTasks }) => {
    const [ganttTasks, setGanttTasks] = useState([]);
    const [viewMode, setViewMode] = useState(ViewMode.Month);
    const [isLoading, setIsLoading] = useState(true);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        assignedToId: sellerId // Default to seller
    });

    useEffect(() => {
        // Convert tasks to Gantt chart format
        setIsLoading(true);

        try {
            if (tasks && tasks.length > 0) {
                // Add a default task if none are available or valid
                const defaultTask = {
                    id: 'default-task',
                    name: 'Default Task',
                    start: new Date(),
                    end: new Date(new Date().setDate(new Date().getDate() + 7)),
                    progress: 0,
                    type: 'task',
                    styles: {
                        progressColor: '#4a6bb6',
                        backgroundColor: '#4a6bb6'
                    }
                };

                // Process tasks
                const formattedTasks = tasks.map((task, index) => {
                    if (!task) return null; // Skip invalid tasks

                    // Ensure start date is valid
                    let startDate = new Date();
                    try {
                        if (task.createdAt) {
                            startDate = new Date(task.createdAt);
                            if (isNaN(startDate.getTime())) startDate = new Date();
                        }
                    } catch (e) {
                        console.warn("Invalid start date for task", task);
                    }

                    // Ensure end date is valid and after start date
                    let endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 7); // Default: 7 days after start

                    try {
                        if (task.deadline) {
                            const taskEndDate = new Date(task.deadline);
                            if (!isNaN(taskEndDate.getTime())) {
                                endDate = taskEndDate;
                                // Make sure end date is not before start date
                                if (endDate < startDate) {
                                    endDate = new Date(startDate);
                                    endDate.setDate(endDate.getDate() + 1);
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("Invalid end date for task", task);
                    }

                    // Generate name and task ID
                    const taskId = task.id || index + 1;
                    const name = task.title || 'Untitled Task';

                    return {
                        id: `task-${taskId}`,
                        name: name,
                        taskID: taskId.toString(), // Custom field for task ID
                        start: startDate,
                        end: endDate,
                        progress: task.status === "COMPLETED" ? 100 : (task.status === "IN_PROGRESS" ? 50 : 0),
                        type: 'task',
                        styles: {
                            progressColor: '#4a6bb6',
                            progressSelectedColor: '#4a6bb6',
                            backgroundColor: '#4a6bb6',
                            backgroundSelectedColor: '#4a6bb6',
                        },
                        isDisabled: false,
                        hideChildren: false,
                        displayOrder: index
                    };
                }).filter(task => task !== null); // Remove any null tasks

                // Ensure we have at least one task to display
                if (formattedTasks.length === 0) {
                    setGanttTasks([defaultTask]);
                } else {
                    setGanttTasks(formattedTasks);
                }
            } else {
                // Create a single default task if no tasks are available
                const defaultTask = {
                    id: 'default-task',
                    name: 'No Tasks Available',
                    taskID: 'N/A',
                    start: new Date(),
                    end: new Date(new Date().setDate(new Date().getDate() + 7)),
                    progress: 0,
                    type: 'task',
                    styles: {
                        progressColor: '#4a6bb6',
                        backgroundColor: '#e2e8f0'
                    }
                };
                setGanttTasks([defaultTask]);
            }
        } catch (error) {
            console.error("Error formatting tasks for Gantt chart:", error);
            // Fallback to a default task
            const defaultTask = {
                id: 'error-task',
                name: 'Error Loading Tasks',
                taskID: 'Error',
                start: new Date(),
                end: new Date(new Date().setDate(new Date().getDate() + 7)),
                progress: 0,
                type: 'task',
                styles: {
                    progressColor: '#ef4444',
                    backgroundColor: '#fee2e2'
                }
            };
            setGanttTasks([defaultTask]);
        }

        setIsLoading(false);
    }, [tasks]);

    // Handle task form submission
    const handleTaskSubmit = async (e) => {
        e.preventDefault();

        if (!taskFormData.title.trim()) {
            toast.error('Task title is required');
            return;
        }

        try {
            // Create new task
            const response = await axios.post(
                `${CREATE_TASK}/${orderId}`,
                taskFormData,
                { withCredentials: true }
            );

            toast.success(isUserSeller ? 'Task created successfully' : 'Task suggestion submitted');

            // Reset form
            setTaskFormData({
                title: '',
                description: '',
                deadline: '',
                assignedToId: sellerId
            });
            setShowTaskForm(false);

            // Refresh tasks to show the newly created task
            if (typeof refreshTasks === 'function') {
                refreshTasks();
            }

        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Failed to save task');
        }
    };

    // Render task form
    const renderTaskForm = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">
                            {isUserSeller ? 'Create Task' : 'Suggest Task'}
                        </h3>
                        <button
                            onClick={() => setShowTaskForm(false)}
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
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                {isUserSeller ? 'Create Task' : 'Suggest Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Customize column display to only show Name, ID and chart
    const getColumns = () => {
        return [
            {
                id: 1,
                label: 'ID',
                value: 'taskID',
                width: 40,
            },
            {
                id: 2,
                label: 'Name',
                value: 'name',
                width: 200,
            }
        ];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10 bg-white rounded-lg shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Custom styles to apply to Gantt component's container
    const ganttContainerStyle = {
        // Leave this empty as we'll handle tooltips with a custom component
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Project Timeline</h2>
                <div className="flex items-center">
                    <button
                        onClick={() => setShowTaskForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center mr-4"
                    >
                        <FaPlus className="mr-2" />
                        {isUserSeller ? 'Add Task' : 'Suggest Task'}
                    </button>

                    <div className="flex shadow-sm rounded overflow-hidden">
                        <button
                            onClick={() => setViewMode(ViewMode.Month)}
                            className={`px-3 py-1 text-sm transition-colors ${viewMode === ViewMode.Month ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode(ViewMode.Week)}
                            className={`px-3 py-1 text-sm transition-colors ${viewMode === ViewMode.Week ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode(ViewMode.Day)}
                            className={`px-3 py-1 text-sm transition-colors ${viewMode === ViewMode.Day ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Day
                        </button>
                    </div>
                </div>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div style={{ height: '550px', overflow: 'auto' }}>
                    {ganttTasks.length > 0 && (
                        <Gantt
                            tasks={ganttTasks}
                            viewMode={viewMode}
                            listCellWidth="240"
                            columnWidth={70}
                            barCornerRadius={0}
                            barFill={15}
                            handleWidth={0}
                            rowHeight={40}
                            headerHeight={50}
                            todayColor="rgba(240, 240, 240, 0.5)"
                            projectBackgroundColor="#ffffff"
                            gridLines={true}
                            rtl={false}
                            fontFamily="Arial, Helvetica, sans-serif"
                            preStepsCount={0}
                            arrowColor="#4a6bb6"
                            locale="en-US"
                            dateFormat="MMM"
                            ganttHeight={550}
                            columns={getColumns()}
                            TooltipContent={({ task }) => (
                                <div className="bg-white shadow-lg rounded-md p-2 text-xs border border-gray-200">
                                    <div className="font-semibold">{task.name}</div>
                                    <div>ID: {task.taskID}</div>
                                    <div>Progress: {task.progress}%</div>
                                </div>
                            )}
                            TaskListHeader={({ headerHeight, fontFamily, fontSize }) => (
                                <div
                                    style={{
                                        height: headerHeight,
                                        fontFamily: fontFamily,
                                        fontSize: fontSize,
                                        display: 'flex',
                                        marginLeft: '0.6rem',
                                    }}
                                >
                                    <div style={{ width: '40px' }}>ID</div>
                                    <div style={{ width: '200px' }}>Name</div>
                                </div>
                            )}
                            TaskListTable={({ rowHeight, rowWidth, tasks, fontFamily, fontSize }) => (
                                <div
                                    style={{
                                        fontFamily,
                                        fontSize,
                                    }}
                                >
                                    {tasks.map(task => (
                                        <div
                                            key={task.id}
                                            style={{
                                                display: 'flex',
                                                height: rowHeight,
                                                borderBottom: '1px solid #e2e8f0',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div style={{ width: '40px', paddingLeft: '0.6rem' }}>{task.taskID}</div>
                                            <div style={{ width: '200px', paddingLeft: '0.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        />
                    )}
                </div>
            </div>

            {/* Add Task Modal */}
            {showTaskForm && renderTaskForm()}
        </div>
    );
};

export default GanttChart; 