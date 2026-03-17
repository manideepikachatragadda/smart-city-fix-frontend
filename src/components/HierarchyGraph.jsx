import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { getHierarchy } from '../services/api';
import { Shield, Briefcase, User } from 'lucide-react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 100;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // Shift coordinates by half of node size to center
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

// Custom Node Component
const CustomNode = ({ data }) => {
    const { label, role, department } = data;

    const roleStyles = {
        admin: 'border-t-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
        manager: 'border-t-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        worker: 'border-t-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    };

    const currentStyle = roleStyles[role?.toLowerCase()] || 'border-t-gray-500 bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300';

    const renderIcon = () => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return <Shield size={16} className="text-purple-600" />;
            case 'manager':
                return <Briefcase size={16} className="text-blue-600" />;
            default:
                return <User size={16} className="text-emerald-600" />;
        }
    };

    return (
        <div className={`relative bg-white dark:bg-zinc-900 shadow-lg rounded-xl border border-gray-100 dark:border-zinc-800 p-4 min-w-[200px] border-t-4 transition-transform hover:scale-105 ${currentStyle.split(' ')[0]}`}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400 dark:!bg-zinc-600 !w-3 !h-3" />

            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentStyle.split(' ').slice(1).join(' ')}`}>
                    {renderIcon()}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">{label}</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-semibold flex flex-col gap-0.5 mt-1">
                        <span>{role}</span>
                        {department && <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-1.5 py-0.5 rounded max-w-fit">{department}</span>}
                    </p>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 dark:!bg-zinc-600 !w-3 !h-3" />
        </div>
    );
};

const nodeTypes = {
    customNode: CustomNode,
};

const HierarchyGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                setLoading(true);
                const users = await getHierarchy();

                const initialNodes = users.map((user) => ({
                    id: user.id.toString(),
                    type: 'customNode',
                    data: {
                        label: `${user.first_name} ${user.last_name}`,
                        role: user.role,
                        department: user.department
                    },
                    position: { x: 0, y: 0 },
                }));

                const initialEdges = users
                    .filter((user) => user.manager_id)
                    .map((user) => ({
                        id: `e-${user.manager_id}-${user.id}`,
                        source: user.manager_id.toString(),
                        target: user.id.toString(),
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#94a3b8', strokeWidth: 2 }
                    }));

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    initialNodes,
                    initialEdges
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            } catch (error) {
                console.error('Failed to fetch hierarchy data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, []);

    const onConnect = useCallback((params) => {
        // Readonly graph, no custom connections allowed by user
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (nodes.length === 0) {
        return (
            <div className="flex items-center justify-center p-10 mb-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 h-[300px] w-full">
                <p className="text-slate-500 dark:text-zinc-400">No organizational data available.</p>
            </div>
        );
    }

    return (
        <div className="mb-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col relative z-10 w-full">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Organization Hierarchy</h3>
            </div>
            <div className="w-full h-[600px] bg-slate-50/30 dark:bg-zinc-900/50">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.1}
                >
                    <Background color="#cbd5e1" gap={16} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};

export default HierarchyGraph;
