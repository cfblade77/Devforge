import React, { useState } from 'react';

/**
 * A reusable tab system component
 * @param {Object} props Component props
 * @param {Array} props.tabs Array of tab objects with id and title properties
 * @param {ReactNode} props.children Tab content components
 * @param {Function} props.onChange Optional callback when active tab changes
 * @param {String} props.activeTab Optional controlled active tab id 
 */
const TabSystem = ({ tabs, children, onChange, activeTab: controlledActiveTab }) => {
    const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);

    // Use controlled or uncontrolled active tab
    const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

    const handleTabClick = (tabId) => {
        if (controlledActiveTab === undefined) {
            setInternalActiveTab(tabId);
        }
        if (onChange) {
            onChange(tabId);
        }
    };

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === tab.id
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {React.Children.map(children, (child) => {
                    // Only render the active tab's content
                    if (child.props.tabId === activeTab) {
                        return child;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

/**
 * Individual tab panel component
 */
export const TabPanel = ({ children, tabId }) => {
    return <div>{children}</div>;
};

export default TabSystem; 