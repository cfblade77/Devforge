import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GET_ORDER_TASKS } from '../../utils/constants';
import { toast } from 'react-toastify';
import TaskBoard from './TaskBoard';
import GanttChart from './GanttChart';
import TabSystem, { TabPanel } from '../Tabs/TabSystem';

/**
 * Wrapper for TaskBoard component for use in the tab system
 */
const TaskBoardSection = ({ orderId, sellerId, buyerId, isUserSeller }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Task view tabs
    const taskViewTabs = [
        { id: 'kanban', title: 'Kanban Board' },
        { id: 'gantt', title: 'Gantt Chart' }
    ];

    // Load tasks function - made reusable for refreshing
    const loadTasks = useCallback(async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            const response = await axios.get(`${GET_ORDER_TASKS}/${orderId}`, {
                withCredentials: true
            });

            const fetchedTasks = response.data.tasks || [];
            setTasks(fetchedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    // Load tasks on component mount or when orderId changes
    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Task Management</h2>

            <TabSystem tabs={taskViewTabs}>
                <TabPanel tabId="kanban">
                    <TaskBoard
                        orderId={orderId}
                        sellerId={sellerId}
                        buyerId={buyerId}
                        isUserSeller={isUserSeller}
                        initialTasks={tasks}
                        isLoading={loading}
                        refreshTasks={loadTasks}
                    />
                </TabPanel>

                <TabPanel tabId="gantt">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <GanttChart
                            tasks={tasks}
                            orderId={orderId}
                            sellerId={sellerId}
                            buyerId={buyerId}
                            isUserSeller={isUserSeller}
                            refreshTasks={loadTasks}
                        />
                    )}
                </TabPanel>
            </TabSystem>
        </div>
    );
};

export default TaskBoardSection; 