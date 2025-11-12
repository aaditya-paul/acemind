"use client";

import React, { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAuth } from "../contexts/AuthContext";
import {
  saveMindmapState,
  getSubtopicDataDB,
  setSubtopicDataDB,
  addExpandedSubtopics,
  getExpandedSubtopics,
  addMultiLevelSubtopics,
  setHierarchicalSubtopicDataDB,
  getHierarchicalSubtopicDataDB,
  getCacheStatistics,
  clearSubtopicCache,
} from "../lib/db";
import GeneralInfoModal from "./GeneralInfoModal";
import SubtopicSidebar from "./SubtopicSidebar";
// import "@/styles/mindmap.css";
// Custom Node Components
const CourseNode = ({ data }) => (
  <div className="group relative">
    <Handle
      type="source"
      position={Position.Right}
      className="w-4 h-4 bg-yellow-400 border-2 border-yellow-600"
    />
    <div className="w-[280px] h-[140px] px-6 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl border border-yellow-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm flex flex-col justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-3 h-3 bg-gray-900 rounded-full mr-2"></div>
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Course
          </span>
        </div>
        <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
          {data.title}
        </h3>
        {data.description && (
          <p className="text-xs text-gray-800 mt-2 opacity-90 line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const UnitNode = ({ data }) => (
  <div className="group relative">
    <Handle
      type="target"
      position={Position.Left}
      className="w-4 h-4 bg-gray-400 border-2 border-gray-500"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="w-4 h-4 bg-gray-400 border-2 border-gray-500"
    />

    <div
      className={`w-[280px] h-[140px] px-5 py-4 rounded-xl border transition-all duration-300 backdrop-blur-sm flex flex-col justify-center ${
        data.isExpanded
          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40 shadow-lg"
          : "bg-gray-800/90 border-gray-600/50 hover:border-gray-500/70 hover:bg-gray-750/90"
      } shadow-lg hover:shadow-xl`}
    >
      <button
        onClick={data.onPlusClick}
        className={`absolute -top-4 -right-4 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-200 z-10 ${
          data.isExpanded
            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400"
            : "bg-gray-700 text-white hover:bg-gray-600 border border-gray-500"
        }`}
      >
        {data.isExpanded ? "−" : "+"}
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              data.isExpanded ? "bg-yellow-400" : "bg-gray-400"
            }`}
          ></div>
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              data.isExpanded ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            Unit {data.unit_num}
          </span>
        </div>
        <h4
          className={`font-bold text-sm leading-tight mb-2 line-clamp-2 ${
            data.isExpanded ? "text-yellow-100" : "text-white"
          }`}
        >
          {data.title}
        </h4>
        {data.duration !== undefined &&
          data.duration !== null &&
          data.duration > 0 && (
            <div className="flex items-center justify-center mt-2">
              <svg
                className="w-3 h-3 text-gray-400 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-gray-400 font-medium">
                {data.duration} Hours
              </span>
            </div>
          )}
      </div>
    </div>
  </div>
);

const SubTopicNode = ({ data }) => (
  <div className="group relative">
    <Handle
      type="target"
      position={Position.Left}
      className="w-3 h-3 bg-gray-500 border-2 border-gray-600"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="w-3 h-3 bg-gray-500 border-2 border-gray-600"
    />

    <div
      className="w-[280px] h-[140px] px-5 py-4 bg-gray-800/50 hover:bg-gray-700/90 rounded-lg border border-gray-600/50 hover:border-gray-500/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-center"
      onClick={data.onNodeClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent node click when button is clicked
          data.onPlusClick();
        }}
        className={`absolute -top-3 -right-3 w-10 h-10 ${
          data.hasExpandedSubtopics
            ? data.isCollapsed
              ? "bg-green-500 hover:bg-green-400"
              : "bg-orange-500 hover:bg-orange-400"
            : "bg-green-500 hover:bg-green-400"
        } text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 z-10 hover:scale-110`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {data.hasExpandedSubtopics && !data.isCollapsed ? (
            // Collapse icon (minus)
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          ) : data.hasExpandedSubtopics && data.isCollapsed ? (
            // Expand icon (plus)
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          ) : (
            // Add new children icon (plus)
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          )}
        </svg>
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-1.5 h-1.5 ${
              data.hasExpandedSubtopics
                ? data.isCollapsed
                  ? "bg-green-400"
                  : "bg-orange-400"
                : "bg-green-400"
            } rounded-full mr-1.5`}
          ></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {data.hasExpandedSubtopics
              ? data.isCollapsed
                ? "Collapsed Topic"
                : "Expanded Topic"
              : "Topic"}
          </span>
        </div>
        <p className="text-sm text-gray-200 font-medium leading-snug group-hover:text-white transition-colors line-clamp-4">
          {data.title}
        </p>
      </div>
    </div>
  </div>
);

const ExpandedSubTopicNode = ({ data }) => (
  <div className="group relative">
    <Handle
      type="target"
      position={Position.Left}
      className="w-2 h-2 bg-purple-500 border-2 border-purple-600"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="w-2 h-2 bg-purple-500 border-2 border-purple-600"
    />

    <div
      className="w-[220px] h-[80px] px-3 py-2 bg-purple-800/30 hover:bg-purple-700/50 rounded-lg border border-purple-500/50 hover:border-purple-400/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-center"
      onClick={data.onNodeClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent node click when button is clicked
          data.onPlusClick();
        }}
        className={`absolute -top-2 -right-2 w-8 h-8 ${
          data.hasSubExpandedTopics
            ? "bg-indigo-500 hover:bg-indigo-400"
            : "bg-purple-500 hover:bg-purple-400"
        } text-white rounded-md flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-200 z-10 hover:scale-110`}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {data.hasSubExpandedTopics ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          )}
        </svg>
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <div
            className={`w-1 h-1 ${
              data.hasSubExpandedTopics ? "bg-indigo-400" : "bg-purple-400"
            } rounded-full mr-1`}
          ></div>
          <span className="text-xs text-purple-300 font-medium uppercase tracking-wide">
            {data.hasSubExpandedTopics ? "Sub-Expanded" : "Expanded"}
          </span>
        </div>
        <p className="text-xs text-purple-100 font-medium leading-snug group-hover:text-white transition-colors line-clamp-2">
          {data.title}
        </p>
      </div>
    </div>
  </div>
);

// Generic recursive subtopic node that adapts based on level
const RecursiveSubtopicNode = ({ data }) => {
  const level = data.level || 0;

  // Color themes for different levels
  const themes = [
    {
      // Level 0 - Original Subtopics (Green/Orange based on state)
      bg: "bg-gray-800/50 hover:bg-gray-700/90",
      border: "border-gray-600/50 hover:border-gray-500/70",
      button: data.hasChildren
        ? data.isCollapsed
          ? "bg-green-500 hover:bg-green-400"
          : "bg-orange-500 hover:bg-orange-400"
        : "bg-green-500 hover:bg-green-400",
      indicator: data.hasChildren
        ? data.isCollapsed
          ? "bg-green-400"
          : "bg-orange-400"
        : "bg-green-400",
      label: data.hasChildren
        ? data.isCollapsed
          ? "Collapsed Topic"
          : "Expanded Topic"
        : "Topic",
      text: "text-gray-200 group-hover:text-white",
      labelColor: "text-gray-400",
      size: "w-[280px] h-[140px] px-5 py-4",
      indicatorSize: "w-1.5 h-1.5 mr-1.5",
      buttonSize: "w-10 h-10 -top-3 -right-3",
      iconSize: "w-4 h-4",
      textSize: "text-sm",
      handle: "w-3 h-3 bg-gray-500 border-2 border-gray-600",
    },
    {
      // Level 1 - Purple theme
      bg: "bg-purple-800/30 hover:bg-purple-700/50",
      border: "border-purple-500/50 hover:border-purple-400/70",
      button: data.hasChildren
        ? data.isCollapsed
          ? "bg-purple-500 hover:bg-purple-400"
          : "bg-orange-500 hover:bg-orange-400"
        : "bg-purple-500 hover:bg-purple-400",
      indicator: data.hasChildren
        ? data.isCollapsed
          ? "bg-purple-400"
          : "bg-orange-400"
        : "bg-purple-400",
      label: data.hasChildren
        ? data.isCollapsed
          ? "Collapsed Sub"
          : "Sub-Expanded"
        : "Expanded",
      text: "text-purple-100 group-hover:text-white",
      labelColor: "text-purple-300",
      size: "w-[220px] h-[80px] px-3 py-2",
      indicatorSize: "w-1 h-1 mr-1",
      buttonSize: "w-8 h-8 -top-2 -right-2",
      iconSize: "w-3 h-3",
      textSize: "text-xs",
      handle: "w-2 h-2 bg-purple-500 border-2 border-purple-600",
    },
    {
      // Level 2 - Indigo theme
      bg: "bg-indigo-800/30 hover:bg-indigo-700/50",
      border: "border-indigo-500/50 hover:border-indigo-400/70",
      button: data.hasChildren
        ? "bg-blue-500 hover:bg-blue-400"
        : "bg-indigo-500 hover:bg-indigo-400",
      indicator: data.hasChildren ? "bg-blue-400" : "bg-indigo-400",
      label: data.hasChildren ? "Deep-Expanded" : "Sub-Expanded",
      text: "text-indigo-100 group-hover:text-white",
      labelColor: "text-indigo-300",
      size: "w-[200px] h-[70px] px-2 py-1.5",
      indicatorSize: "w-0.5 h-0.5 mr-0.5",
      buttonSize: "w-7 h-7 -top-1.5 -right-1.5",
      iconSize: "w-2.5 h-2.5",
      textSize: "text-xs",
      handle: "w-1.5 h-1.5 bg-indigo-500 border-2 border-indigo-600",
    },
    {
      // Level 3+ - Blue theme (gets smaller and more compact)
      bg: "bg-blue-800/30 hover:bg-blue-700/50",
      border: "border-blue-500/50 hover:border-blue-400/70",
      button: data.hasChildren
        ? "bg-cyan-500 hover:bg-cyan-400"
        : "bg-blue-500 hover:bg-blue-400",
      indicator: data.hasChildren ? "bg-cyan-400" : "bg-blue-400",
      label: data.hasChildren ? "Ultra-Deep" : "Deep",
      text: "text-blue-100 group-hover:text-white",
      labelColor: "text-blue-300",
      size: "w-[180px] h-[60px] px-2 py-1",
      indicatorSize: "w-0.5 h-0.5 mr-0.5",
      buttonSize: "w-6 h-6 -top-1 -right-1",
      iconSize: "w-2 h-2",
      textSize: "text-xs",
      handle: "w-1 h-1 bg-blue-500 border-2 border-blue-600",
    },
  ];

  // Use theme based on level, fallback to last theme for deeper levels
  const theme = themes[Math.min(level, themes.length - 1)];

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Left} className={theme.handle} />
      <Handle
        type="source"
        position={Position.Right}
        className={theme.handle}
      />

      <div
        className={`${theme.size} ${theme.bg} rounded-lg border ${theme.border} backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-center`}
        onClick={data.onNodeClick}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onPlusClick();
          }}
          className={`absolute ${theme.buttonSize} ${theme.button} text-white rounded-md flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-200 z-10 hover:scale-110`}
        >
          <svg
            className={theme.iconSize}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {data.hasChildren && !data.isCollapsed ? (
              // Collapse icon (minus)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            ) : data.hasChildren && data.isCollapsed ? (
              // Expand icon (plus)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            ) : (
              // Add new children icon (plus)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            )}
          </svg>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <div
              className={`${theme.indicatorSize} ${theme.indicator} rounded-full`}
            ></div>
            <span
              className={`text-xs ${theme.labelColor} font-medium uppercase tracking-wide`}
            >
              {theme.label}
            </span>
          </div>
          <p
            className={`${theme.textSize} ${theme.text} font-medium leading-snug transition-colors line-clamp-2`}
          >
            {data.title}
          </p>
        </div>
      </div>
    </div>
  );
};

// Node types
const nodeTypes = {
  course: CourseNode,
  unit: UnitNode,
  subtopic: SubTopicNode,
  expandedSubtopic: ExpandedSubTopicNode,
  recursiveSubtopic: RecursiveSubtopicNode,
};

function MindMap({
  chatData,
  chatId,
  mindmapState,
  closeSidebar,
  openSidebar,
  setSelectedSubTopic,
  setSubtopicData,
  setAllSubtopicsData,
}) {
  const { user } = useAuth();
  const reactFlowInstance = useRef(null);
  const [expandedUnits, setExpandedUnits] = React.useState(new Set([0])); // First unit expanded by default
  const [expandedSubtopicsData, setExpandedSubtopicsData] = React.useState({}); // Track expanded subtopics
  const [collapsedSubtopics, setCollapsedSubtopics] = React.useState(new Set()); // Track collapsed subtopics
  const [defaultViewport] = React.useState({ x: 0, y: 0, zoom: 0.4 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadedSubtopicsData, setLoadedSubtopicsData] = React.useState({}); // Track all loaded subtopic data
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  const [sidebarState, setSidebarState] = React.useState({
    isOpen: false,
    subtopicData: null,
  });

  // Update allSubtopicsData whenever loadedSubtopicsData changes
  React.useEffect(() => {
    if (setAllSubtopicsData && typeof setAllSubtopicsData === "function") {
      const allData = Object.values(loadedSubtopicsData).filter(
        (data) => data && data.aiResponse
      );
      setAllSubtopicsData(allData);
    }
  }, [loadedSubtopicsData, setAllSubtopicsData]);

  // Helper function to update both subtopic data states
  const updateSubtopicData = React.useCallback((data, hierarchyKey = null) => {
    setSubtopicData(data);
    if (data && hierarchyKey) {
      setLoadedSubtopicsData((prev) => ({
        ...prev,
        [hierarchyKey]: data,
      }));
    }
  }, []);

  // Load saved mindmap state on component mount
  React.useEffect(() => {
    if (mindmapState) {
      const {
        expandedUnits: savedExpanded,
        viewport,
        nodePositions,
      } = mindmapState;

      if (savedExpanded && Array.isArray(savedExpanded)) {
        setExpandedUnits(new Set(savedExpanded));
      }

      if (viewport && reactFlowInstance.current) {
        setTimeout(() => {
          reactFlowInstance.current.setViewport(viewport);
        }, 100);
      }

      // Apply saved node positions
      if (nodePositions && reactFlowInstance.current) {
        setTimeout(() => {
          const currentNodes = reactFlowInstance.current.getNodes();
          const updatedNodes = currentNodes.map((node) => ({
            ...node,
            position: nodePositions[node.id] || node.position,
          }));
          reactFlowInstance.current.setNodes(updatedNodes);
        }, 150);
      }
    }
  }, [mindmapState]);

  // Load expanded subtopics on component mount
  React.useEffect(() => {
    const loadExpandedSubtopics = async () => {
      if (chatId && user?.uid) {
        try {
          const result = await getExpandedSubtopics(chatId, user.uid);
          if (result.success) {
            setExpandedSubtopicsData(result.data);
          }
        } catch (error) {
          console.error("Error loading expanded subtopics:", error);
        }
      }
    };

    loadExpandedSubtopics();
  }, [chatId, user?.uid]);

  const showModal = (type, title, message) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const saveMindmapStateToDb = async () => {
    if (!chatId || !user?.uid || !reactFlowInstance.current) {
      showModal(
        "error",
        "Save Failed",
        "Unable to save: Missing required data"
      );
      return;
    }

    setIsLoading(true);
    try {
      const viewport = reactFlowInstance.current.getViewport();
      const nodes = reactFlowInstance.current.getNodes();

      const nodePositions = {};
      nodes.forEach((node) => {
        nodePositions[node.id] = node.position;
      });

      const mindmapStateToSave = {
        expandedUnits,
        viewport,
        nodePositions,
      };

      const result = await saveMindmapState(
        chatId,
        user.uid,
        mindmapStateToSave
      );

      if (result.success) {
        showModal("success", "Success", "Mindmap state saved successfully!");
      } else {
        showModal(
          "error",
          "Save Failed",
          result.message || "Failed to save mindmap state"
        );
      }
    } catch (error) {
      console.error("Error saving mindmap state:", error);
      showModal("error", "Error", "An unexpected error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  const resetMindmapToDefault = () => {
    // Reset expanded units to default (first unit expanded)
    setExpandedUnits(new Set([0]));

    // Reset viewport and force nodes to default positions
    setTimeout(() => {
      if (reactFlowInstance.current) {
        // Force all nodes to their default calculated positions by clearing any saved positions
        const currentNodes = reactFlowInstance.current.getNodes();
        const resetNodes = currentNodes.map((node) => {
          // Force recalculation by removing any saved position influence
          if (node.id === "subject") {
            return { ...node, position: { x: 50, y: 400 } };
          }
          return node;
        });

        reactFlowInstance.current.setNodes(resetNodes);

        // Smooth fit view to show the reset layout
        setTimeout(() => {
          reactFlowInstance.current.fitView({
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5,
            duration: 500, // Smooth transition duration
          });
        }, 100);
      }
    }, 150);

    showModal(
      "info",
      "Reset Complete",
      "Mindmap has been reset to default state"
    );
  };

  // Function to handle collapsing/expanding subtopics
  const handleSubtopicCollapse = (hierarchyPath) => {
    const hierarchyKey = hierarchyPath.join("-");

    setCollapsedSubtopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hierarchyKey)) {
        // Currently collapsed, so expand it
        newSet.delete(hierarchyKey);
        console.log(`🔄 Expanding subtopic: ${hierarchyKey}`);
      } else {
        // Currently expanded, so collapse it
        newSet.add(hierarchyKey);
        console.log(`🔽 Collapsing subtopic: ${hierarchyKey}`);
      }
      return newSet;
    });
  };

  // Function to check if a subtopic should be shown (not collapsed)
  const isSubtopicVisible = (hierarchyPath) => {
    const hierarchyKey = hierarchyPath.join("-");
    return !collapsedSubtopics.has(hierarchyKey);
  };

  // Generic recursive handler for any level of subtopic expansion
  const handleRecursiveSubtopicExpansion = async (
    hierarchyPath,
    subtopicTitle,
    parentTitle,
    level,
    unitTitle,
    contextData = {}
  ) => {
    console.log(
      `🚀 Recursive subtopic expansion: Level ${level}, Path: ${hierarchyPath.join(
        "-"
      )}, Title: "${subtopicTitle}"`
    );

    const hierarchyKey = hierarchyPath.join("-");

    // Check if this subtopic is currently collapsed but has data
    if (
      collapsedSubtopics.has(hierarchyKey) &&
      expandedSubtopicsData[hierarchyKey]
    ) {
      // Just expand (uncollapse) without API call
      handleSubtopicCollapse(hierarchyPath);
      // showModal(
      //   "info",
      //   "Expanded from Cache",
      //   `Subtopic "${subtopicTitle}" expanded from cached data.`
      // );
      return;
    }

    // Check if it's currently expanded and should be collapsed
    if (
      expandedSubtopicsData[hierarchyKey] &&
      !collapsedSubtopics.has(hierarchyKey)
    ) {
      // Collapse it
      handleSubtopicCollapse(hierarchyPath);
      // showModal(
      //   "info",
      //   "Collapsed",
      //   `Subtopic "${subtopicTitle}" has been collapsed.`
      // );
      return;
    }

    setIsLoading(true);

    try {
      // Check if this path has already been expanded in the database
      const existingExpanded = await getExpandedSubtopics(chatId, user.uid);

      if (existingExpanded.success && existingExpanded.data[hierarchyKey]) {
        // Data exists in database, load it without API call
        setExpandedSubtopicsData((prev) => ({
          ...prev,
          [hierarchyKey]: existingExpanded.data[hierarchyKey],
        }));

        // Make sure it's not collapsed
        setCollapsedSubtopics((prev) => {
          const newSet = new Set(prev);
          newSet.delete(hierarchyKey);
          return newSet;
        });

        // showModal(
        //   "info",
        //   "Loaded from Database",
        //   `Subtopic "${subtopicTitle}" expanded with ${
        //     existingExpanded.data[hierarchyKey].expandedTopics?.length || 4
        //   } cached topics.`
        // );
        setIsLoading(false);
        return;
      }

      // If no data exists, generate new data via API
      const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const response = await fetch(`${apiUrl}/api/expand-subtopics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid, // Track user for analytics
          topic: chatData.topic,
          subtopic: subtopicTitle,
          unitTitle: unitTitle,
          syllabus: chatData.syllabusContext || "No syllabus context provided",
          count: 4,
          level: level, // Include level for better AI context
          parentContext: parentTitle, // Provide parent context
          hierarchyPath: hierarchyPath, // Include full hierarchy path
          ...contextData, // Include any additional context data
        }),
      });

      if (!response.ok) {
        showModal(
          "error",
          "API Error",
          `Failed to generate level-${level} expanded subtopics. Please try again. (Status: ${response.status})`
        );
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log(`✅ Level-${level} subtopics generated:`, data);

      // Ensure we always get an array of subtopics
      let expandedSubtopics = [];
      if (data.subtopics && Array.isArray(data.subtopics)) {
        expandedSubtopics = data.subtopics;
      } else if (data.data?.subtopics && Array.isArray(data.data.subtopics)) {
        expandedSubtopics = data.data.subtopics;
      } else if (
        data.expandedSubtopics &&
        Array.isArray(data.expandedSubtopics)
      ) {
        expandedSubtopics = data.expandedSubtopics;
      } else if (Array.isArray(data.data)) {
        expandedSubtopics = data.data;
      } else if (Array.isArray(data)) {
        expandedSubtopics = data;
      }

      if (!expandedSubtopics || expandedSubtopics.length === 0) {
        showModal(
          "error",
          "No Subtopics Generated",
          `Failed to generate level-${level} expanded subtopics for "${subtopicTitle}". Please try again.`
        );
        setIsLoading(false);
        return;
      }

      console.log(
        `📊 Generated ${expandedSubtopics.length} subtopics for level ${level}:`,
        expandedSubtopics
      );

      // Save using the new multi-level function with enhanced metadata
      const result = await addMultiLevelSubtopics(
        chatId,
        user.uid,
        hierarchyPath,
        expandedSubtopics,
        subtopicTitle,
        level
      );

      if (result.success) {
        // showModal(
        //   "success",
        //   "Subtopics Expanded",
        //   `Successfully generated ${expandedSubtopics.length} level-${level} subtopics for "${subtopicTitle}". Click them to explore further!`
        // );

        // Refresh expanded subtopics data to update the mindmap
        const updatedExpanded = await getExpandedSubtopics(chatId, user.uid);
        if (updatedExpanded.success) {
          setExpandedSubtopicsData(updatedExpanded.data);
          console.log(
            "🔄 Updated expanded subtopics data:",
            updatedExpanded.data
          );
        }

        // Make sure the new expansion is not collapsed
        setCollapsedSubtopics((prev) => {
          const newSet = new Set(prev);
          newSet.delete(hierarchyKey);
          return newSet;
        });
      } else {
        showModal(
          "error",
          "Save Failed",
          `Generated subtopics but failed to save them to database: ${result.message}`
        );
      }
    } catch (error) {
      console.error("Error in recursive subtopic expansion:", error);
      showModal(
        "error",
        "Error",
        "An unexpected error occurred while expanding subtopics."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Generic recursive handler for subtopic node clicks
  const handleRecursiveSubtopicNodeClick = async (
    hierarchyPath,
    subtopicTitle,
    level,
    contextData = {}
  ) => {
    console.log(
      `🎯 Recursive subtopic clicked: Level ${level}, Path: ${hierarchyPath.join(
        "-"
      )}, Title: "${subtopicTitle}"`
    );

    openSidebar();
    setSubtopicData(null);

    try {
      // First check if content is already available in expandedSubtopicsData
      const hierarchyKey = hierarchyPath.join("-");
      const existingData = expandedSubtopicsData[hierarchyKey];

      if (existingData && existingData.content) {
        console.log("📚 Content found in expandedSubtopicsData:", existingData);
        // showModal(
        //   "info",
        //   "Loaded from Memory",
        //   `Subtopic "${subtopicTitle}" loaded from memory cache.`
        // );
        updateSubtopicData(existingData, hierarchyKey);
        // Also store in loadedSubtopicsData
        setLoadedSubtopicsData((prev) => ({
          ...prev,
          [hierarchyKey]: existingData,
        }));
        return;
      }

      // Try to get detailed content from database using hierarchical path
      const dbResult = await getHierarchicalSubtopicDataDB(
        chatId,
        user.uid,
        hierarchyPath
      );

      if (dbResult.success) {
        console.log(
          "📚 Hierarchical subtopic data found in database:",
          dbResult.data
        );
        // Show cache indicator in modal
        // showModal(
        //   "info",
        //   "Loaded from Cache",
        //   `Subtopic "${subtopicTitle}" loaded from cached data. Saved on: ${new Date(
        //     dbResult.data.cacheTimestamp || dbResult.data.savedAt
        //   ).toLocaleString()}`
        // );
        setSubtopicData(dbResult.data);
        return;
      }

      // If not found in database, fetch from API
      console.log(
        "🌐 Hierarchical subtopic data not found in database, fetching from API..."
      );

      const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
      let response = await fetch(`${apiUrl}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid, // Track user for analytics
          topic: chatData.topic,
          subtopic: subtopicTitle,
          syllabus: chatData.syllabusContext || "No syllabus context provided",
          level: level,
          hierarchyPath: hierarchyPath,
          parentContext:
            hierarchyPath.length > 1
              ? hierarchyPath.slice(0, -1).join(" > ")
              : null,
          ...contextData,
        }),
      });

      if (!response.ok) {
        showModal(
          "error",
          "API Error",
          `Failed to fetch details for "${subtopicTitle}" (Level ${level}). Please try again. (Status: ${response.status})`
        );
        return;
      }

      const data = await response.json();
      console.log(
        "📖 Hierarchical subtopic details fetched from API:",
        data.data
      );

      // Ensure proper data structure before saving
      const apiResponseData = data.data || data;

      // Add metadata to the subtopic data with enhanced context
      const subtopicDataWithMeta = {
        ...apiResponseData,
        // Ensure proper data types
        content: Array.isArray(apiResponseData.content)
          ? apiResponseData.content
          : [],
        hierarchyPath,
        subtopicTitle,
        level,
        syllabus: chatData.syllabusContext,
        topic: chatData.topic,
        isRecursiveSubtopic: true,
        parentContext:
          hierarchyPath.length > 1
            ? hierarchyPath.slice(0, -1).join(" > ")
            : null,
        generationTimestamp: new Date().toISOString(),
        dataSource: "api",
        ...contextData,
      };

      // Save to database for future use with hierarchical support
      const saveResult = await setHierarchicalSubtopicDataDB(
        chatId,
        user.uid,
        subtopicDataWithMeta,
        hierarchyPath
      );

      if (saveResult.success) {
        console.log("💾 Hierarchical subtopic data saved to database");
      } else {
        console.warn(
          "⚠️ Failed to save hierarchical subtopic data:",
          saveResult.message
        );
      }

      updateSubtopicData(subtopicDataWithMeta, hierarchyPath.join("-"));
    } catch (error) {
      console.error("❌ Error fetching hierarchical subtopic details:", error);
      showModal(
        "error",
        "Unexpected Error",
        `An unexpected error occurred while fetching details for "${subtopicTitle}". Please try again.`
      );
    }
  };

  const handleUnitPlusClick = (unitIndex) => {
    console.log("Unit plus clicked:", unitIndex);
    // Toggle the clicked unit - expand if collapsed, collapse if expanded
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitIndex)) {
        // Unit is expanded, so collapse it
        newSet.delete(unitIndex);
      } else {
        // Unit is collapsed, so expand it
        newSet.add(unitIndex);
      }
      return newSet;
    });
  };

  const handleSubTopicPlusClick = async (
    unitIndex,
    subTopicIndex,
    subtopicTitle,
    unitTitle,
    unitNumber
  ) => {
    console.log(
      `Subtopic PLUS button clicked: Unit ${unitIndex + 1}, Subtopic ${
        subTopicIndex + 1
      } - Handling expand/collapse...`
    );

    // Use the recursive handler with level 1 expansion
    const hierarchyPath = [unitIndex, subTopicIndex];
    await handleRecursiveSubtopicExpansion(
      hierarchyPath,
      subtopicTitle,
      subtopicTitle, // parent is self for first level
      1, // level 1
      unitTitle,
      {
        unitIndex,
        subTopicIndex,
        unitTitle,
        unitNumber,
      }
    );
  };

  const handleExpandedSubTopicPlusClick = async (
    unitIndex,
    subTopicIndex,
    expandedIndex,
    expandedSubtopicTitle,
    parentSubtopicTitle,
    unitTitle,
    unitNumber
  ) => {
    console.log(
      `Expanded Subtopic PLUS button clicked: Unit ${unitIndex + 1}, Subtopic ${
        subTopicIndex + 1
      }, Expanded ${expandedIndex + 1} - Generating sub-expanded subtopics...`
    );

    // Use the recursive handler with level 2 expansion
    const hierarchyPath = [unitIndex, subTopicIndex, expandedIndex];
    await handleRecursiveSubtopicExpansion(
      hierarchyPath,
      expandedSubtopicTitle,
      parentSubtopicTitle,
      2, // level 2
      unitTitle,
      {
        unitIndex,
        subTopicIndex,
        expandedIndex,
        parentSubtopicTitle,
        unitTitle,
        unitNumber,
      }
    );
  };

  const handleExpandedSubTopicNodeClick = async (
    syllabus,
    topic,
    unitIndex,
    subTopicIndex,
    expandedIndex,
    expandedSubtopicTitle,
    parentSubtopicTitle,
    unitTitle,
    unitNumber
  ) => {
    console.log("Expanded subtopic clicked:", {
      unitIndex,
      subTopicIndex,
      expandedIndex,
      expandedSubtopicTitle,
    });

    // Use the recursive handler with level 2
    const hierarchyPath = [unitIndex, subTopicIndex, expandedIndex];
    await handleRecursiveSubtopicNodeClick(
      hierarchyPath,
      expandedSubtopicTitle,
      2, // level 2
      {
        syllabus,
        topic,
        unitIndex,
        subTopicIndex,
        expandedIndex,
        parentSubtopicTitle,
        unitTitle,
        unitNumber,
        isExpandedSubtopic: true,
      }
    );
  };

  const handleSubTopicNodeClick = async (
    syllabus,
    topic,
    unitIndex,
    subTopicIndex,
    subtopicTitle,
    unitTitle,
    unitNumber
  ) => {
    console.log("Subtopic clicked:", {
      unitIndex,
      subTopicIndex,
      subtopicTitle,
    });

    openSidebar();
    setSubtopicData(null);

    try {
      // Check if this is actually an expanded subtopic that might have content in memory
      const hierarchyKey = `${unitIndex}-${subTopicIndex}`;
      const memoryData = expandedSubtopicsData[hierarchyKey];

      if (memoryData && memoryData.content) {
        console.log("📚 Base subtopic content found in memory:", memoryData);
        // showModal(
        //   "info",
        //   "Loaded from Memory",
        //   `Subtopic "${subtopicTitle}" loaded from memory cache.`
        // );
        setSubtopicData(memoryData);
        return;
      }

      // Try to get data from database cache
      const dbResult = await getSubtopicDataDB(
        chatId,
        user.uid,
        unitIndex,
        subTopicIndex
      );

      if (dbResult.success) {
        console.log("Subtopic data found in database:", dbResult.data);
        // Show cache indicator in modal
        // showModal(
        //   "info",
        //   "Loaded from Cache",
        //   `Subtopic "${subtopicTitle}" loaded from cached data. Saved on: ${new Date(
        //     dbResult.data.cacheTimestamp || dbResult.data.savedAt
        //   ).toLocaleString()}`
        // );
        setSubtopicData(dbResult.data);
        return;
      }

      // If not found in database, fetch from API
      console.log("Subtopic data not found in database, fetching from API...");

      const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
      let response = await fetch(`${apiUrl}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid, // Track user for analytics
          topic: topic,
          subtopic: subtopicTitle,
          syllabus: syllabus,
        }),
      });

      if (!response.ok) {
        showModal(
          "error",
          "Error",
          "Failed to fetch subtopic details. Please try again."
        );
        return;
      }

      const data = await response.json();
      console.log("Subtopic details fetched successfully from API:", data.data);

      // Ensure proper data structure before saving
      const apiResponseData = data.data || data;

      // Add metadata to the subtopic data
      const subtopicDataWithMeta = {
        ...apiResponseData,
        // Ensure proper data types
        content: Array.isArray(apiResponseData.content)
          ? apiResponseData.content
          : [],
        unitIndex,
        subTopicIndex,
        subtopicTitle,
        unitTitle,
        unitNumber,
        syllabus,
        topic,
        generationTimestamp: new Date().toISOString(),
        dataSource: "api",
      };

      // Save to database for future use
      await setSubtopicDataDB(chatId, user.uid, subtopicDataWithMeta);

      setSubtopicData(subtopicDataWithMeta);
    } catch (error) {
      console.error("Error fetching subtopic details:", error);
      showModal(
        "error",
        "Error",
        "An unexpected error occurred while fetching subtopic details."
      );
    }
  };

  // Recursive function to generate subtopic nodes at any depth
  const generateRecursiveSubtopics = (
    unitIndex,
    subIndex,
    parentNodeId,
    parentX,
    parentY,
    expandedUnitPosition,
    parentTitle,
    unitTitle,
    unitNumber,
    chatData,
    courseData,
    nodes,
    edges,
    currentPath = [unitIndex, subIndex],
    level = 1,
    maxDepth = 10, // Reasonable limit to prevent infinite expansion
    totalExpandedUnits = 1 // Pass down total expanded units for better spacing
  ) => {
    if (level > maxDepth) {
      console.log(
        `Max depth ${maxDepth} reached for path: ${currentPath.join("-")}`
      );
      return;
    }

    const hierarchyKey = currentPath.join("-");
    const rawExpandedSubtopics =
      expandedSubtopicsData[hierarchyKey]?.expandedTopics;
    const expandedSubtopics = Array.isArray(rawExpandedSubtopics)
      ? rawExpandedSubtopics
      : [];

    // Check if this subtopic is collapsed
    if (collapsedSubtopics.has(hierarchyKey)) {
      return; // Don't show children if collapsed
    }

    if (expandedSubtopics.length === 0) {
      return; // No children to create
    }

    const expandedCount = expandedSubtopics.length;

    // Calculate positions for this level
    const nodeSpacing = Math.max(60, 120 - level * 10); // Decrease spacing with depth
    const expandedStartY = parentY - ((expandedCount - 1) * nodeSpacing) / 2;

    // Enhanced horizontal position calculation to prevent overlapping
    const baseSpacing = level === 1 ? 450 : 320; // Increased base spacing for first level, standard for deeper levels
    const levelMultiplier = Math.max(0.8, 1 - level * 0.08); // More gradual reduction with depth

    // Dynamic unit offset based on level, expanded unit position, and total expanded units
    const unitOffsetMultiplier = Math.max(0.6, 1 - level * 0.1); // Reduce unit offset gradually with depth (fixed typo)
    const totalUnitsMultiplier = Math.max(1, totalExpandedUnits * 0.2); // Account for total expanded units
    const dynamicUnitOffset =
      expandedUnitPosition * 80 * unitOffsetMultiplier * totalUnitsMultiplier;

    // Level-based spacing to ensure each level has enough room
    const levelSpacing = level * 40; // Additional spacing per level to prevent overlap

    const horizontalSpacing = baseSpacing * levelMultiplier;
    const childX =
      parentX + horizontalSpacing + dynamicUnitOffset + levelSpacing;

    expandedSubtopics.forEach((expandedTopic, expandedIndex) => {
      const childPath = [...currentPath, expandedIndex];
      const childId = `recursive-${childPath.join("-")}`;
      const childY = expandedStartY + expandedIndex * nodeSpacing;

      // Check if this child has its own children
      const childHierarchyKey = childPath.join("-");
      const childExpandedTopics =
        expandedSubtopicsData[childHierarchyKey]?.expandedTopics;
      const hasChildren =
        Array.isArray(childExpandedTopics) && childExpandedTopics.length > 0;
      const isCollapsed = collapsedSubtopics.has(childHierarchyKey);

      // Create the node
      nodes.push({
        id: childId,
        type: "recursiveSubtopic",
        position: { x: childX, y: childY },
        data: {
          title: expandedTopic,
          level: level,
          hasChildren: hasChildren,
          isCollapsed: isCollapsed,
          hierarchyPath: childPath,
          onNodeClick: () =>
            handleRecursiveSubtopicNodeClick(childPath, expandedTopic, level, {
              unitIndex,
              subIndex,
              unitTitle,
              unitNumber,
              parentTitle,
              syllabus:
                chatData.syllabusContext ||
                courseData.syllabusContext ||
                "No syllabus context provided",
              topic: chatData.topic || "No topic",
            }),
          onPlusClick: () =>
            handleRecursiveSubtopicExpansion(
              childPath,
              expandedTopic,
              parentTitle,
              level + 1, // Next level
              unitTitle,
              {
                unitIndex,
                subIndex,
                unitTitle,
                unitNumber,
                parentTitle,
              }
            ),
        },
      });

      // Create edge from parent to child
      const edgeColors = [
        "#10b981",
        "#a855f7",
        "#3b82f6",
        "#ef4444",
        "#f59e0b",
        "#8b5cf6",
      ];
      const edgeColor = edgeColors[Math.min(level - 1, edgeColors.length - 1)];

      edges.push({
        id: `${parentNodeId}-${childId}`,
        source: parentNodeId,
        target: childId,
        type: "default",
        style: {
          stroke: edgeColor,
          strokeWidth: Math.max(1, 2 - level * 0.2),
          strokeDasharray: level === 1 ? "3,3" : `${2 + level},${2 + level}`,
        },
        animated: level <= 2,
      });

      // Recursively generate children for this node
      generateRecursiveSubtopics(
        unitIndex,
        subIndex,
        childId,
        childX,
        childY,
        expandedUnitPosition,
        expandedTopic, // This becomes the new parent title
        unitTitle,
        unitNumber,
        chatData,
        courseData,
        nodes,
        edges,
        childPath,
        level + 1,
        maxDepth,
        totalExpandedUnits // Pass down total expanded units
      );
    });
  };

  // Generate nodes and edges from chatData
  const { initialNodes, initialEdges } = React.useMemo(() => {
    console.log("ChatData received:", chatData); // Debug log

    if (!chatData) {
      return { initialNodes: [], initialEdges: [] };
    }

    // Handle different data structures
    let courseData;
    if (chatData.aiResponse) {
      // If chatData has aiResponse property, parse it
      try {
        courseData =
          typeof chatData.aiResponse === "string"
            ? JSON.parse(chatData.aiResponse)
            : chatData.aiResponse;
      } catch (e) {
        console.error("Error parsing aiResponse:", e);
        return { initialNodes: [], initialEdges: [] };
      }
    } else {
      // Direct data structure
      courseData = chatData;
    }

    if (!courseData || !courseData.units || !Array.isArray(courseData.units)) {
      console.log("No units found in courseData:", courseData);
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes = [];
    const edges = [];

    // Get saved node positions if available (but not during reset)
    const savedNodePositions = mindmapState?.nodePositions || {};

    // Subject/Topic node (leftmost) - always use default position for consistent layout
    const subjectPosition = { x: 50, y: 400 };
    nodes.push({
      id: "subject",
      type: "course",
      position: subjectPosition,
      data: {
        title: chatData.topic || courseData.courseTitle || "Subject",
        description: "",
      },
    });

    // Determine which units to show - show all units
    const unitsToShow = courseData.units;
    const unitCount = unitsToShow.length;

    // Calculate dynamic spacing based on expanded units and their subtopic counts
    let totalRequiredHeight = 0;
    const unitSpacingData = [];

    unitsToShow.forEach((unit, unitIndex) => {
      const isExpanded = expandedUnits.has(unitIndex);
      const subTopicsCount =
        isExpanded && unit.sub_topics ? unit.sub_topics.length : 0;

      // Calculate additional height needed for expanded subtopics
      let expandedSubtopicsHeight = 0;
      if (isExpanded && unit.sub_topics) {
        unit.sub_topics.forEach((subTopic, subIndex) => {
          const expandedKey = `${unitIndex}-${subIndex}`;
          const rawExpandedSubtopics =
            expandedSubtopicsData[expandedKey]?.expandedTopics;
          const expandedSubtopics = Array.isArray(rawExpandedSubtopics)
            ? rawExpandedSubtopics
            : [];
          if (expandedSubtopics.length > 0) {
            expandedSubtopicsHeight = Math.max(
              expandedSubtopicsHeight,
              expandedSubtopics.length * 100
            );
          }
        });
      }

      const unitRequiredHeight = Math.max(
        140,
        subTopicsCount * 180,
        expandedSubtopicsHeight
      ); // Account for expanded subtopics

      unitSpacingData.push({
        unitIndex,
        isExpanded,
        subTopicsCount,
        requiredHeight: unitRequiredHeight,
        yPosition: totalRequiredHeight,
      });

      totalRequiredHeight += unitRequiredHeight + 120; // Add spacing between units
    });

    const unitStartY = 400 - (totalRequiredHeight - 120) / 2; // Center all units vertically

    // Create unit nodes and their subtopics
    let currentSubTopicY = unitStartY; // Track the current Y position for subtopics

    // Get array of expanded unit indices for dynamic spacing calculation
    const expandedUnitIndices = unitsToShow
      .map((unit, index) => ({ unit, index }))
      .filter(({ index }) => expandedUnits.has(index))
      .map(({ index }) => index);

    unitsToShow.forEach((unit, unitIndex) => {
      const unitId = `unit-${unit.unit_num || unitIndex}`;
      const spacingData = unitSpacingData[unitIndex];
      const unitY =
        unitStartY +
        spacingData.yPosition +
        spacingData.requiredHeight / 2 -
        70; // Center unit in its allocated space

      // Unit node (middle column) - always in order
      nodes.push({
        id: unitId,
        type: "unit",
        position: { x: 700, y: unitY }, // Fixed position to maintain order
        data: {
          unit_num: unit.unit_num || unitIndex + 1,
          title: unit.title,
          duration: unit.duration,
          isExpanded: expandedUnits.has(unitIndex),
          onPlusClick: () => handleUnitPlusClick(unitIndex),
        },
      });

      // Edge from subject to unit
      edges.push({
        id: `subject-${unitId}`,
        source: "subject",
        target: unitId,
        type: "default",
        style: {
          stroke: expandedUnits.has(unitIndex) ? "#f59e0b" : "#fbbf24",
          strokeWidth: expandedUnits.has(unitIndex) ? 3 : 2,
          strokeDasharray: expandedUnits.has(unitIndex) ? "none" : "5,5",
        },
        animated: expandedUnits.has(unitIndex),
      });

      // Show subtopics only for expanded units
      if (
        expandedUnits.has(unitIndex) &&
        unit.sub_topics &&
        Array.isArray(unit.sub_topics)
      ) {
        const subTopicsToShow = unit.sub_topics;
        const subTopicsCount = subTopicsToShow.length;

        // Calculate subtopic positions to center them around the unit node
        const totalSubTopicsHeight = (subTopicsCount - 1) * 180; // Total height span of subtopics
        const subTopicsStartY = unitY - totalSubTopicsHeight / 2; // Center subtopics around unit Y position

        subTopicsToShow.forEach((subTopic, subIndex) => {
          const subTopicId = `subtopic-${
            unit.unit_num || unitIndex
          }-${subIndex}`;
          const subTopicY = subTopicsStartY + subIndex * 180; // Position relative to unit center

          // Enhanced horizontal spacing to prevent overlaps across all levels
          const expandedUnitPosition = expandedUnitIndices.indexOf(unitIndex);
          const totalExpandedUnits = expandedUnitIndices.length;
          const baseSubTopicX = 1200;

          // Dynamic spacing based on number of expanded units
          const baseHorizontalSpacing = 400;
          const spacingMultiplier = Math.max(1, totalExpandedUnits * 0.15); // Increase spacing with more expanded units
          const horizontalSpacing = baseHorizontalSpacing * spacingMultiplier;

          const subTopicX =
            baseSubTopicX + expandedUnitPosition * horizontalSpacing;

          // Check if this subtopic has expanded subtopics
          const expandedKey = `${unitIndex}-${subIndex}`;
          const rawExpandedSubtopics =
            expandedSubtopicsData[expandedKey]?.expandedTopics;
          const expandedSubtopics = Array.isArray(rawExpandedSubtopics)
            ? rawExpandedSubtopics
            : [];
          const hasExpandedSubtopics = expandedSubtopics.length > 0;
          const isCollapsed = collapsedSubtopics.has(expandedKey);

          // Subtopic node
          nodes.push({
            id: subTopicId,
            type: "subtopic",
            position: { x: subTopicX, y: subTopicY },
            data: {
              title:
                typeof subTopic === "string"
                  ? subTopic
                  : subTopic.title || `Subtopic ${subIndex + 1}`,
              hasExpandedSubtopics: hasExpandedSubtopics,
              isCollapsed: isCollapsed,
              onNodeClick: () =>
                handleSubTopicNodeClick(
                  chatData.syllabusContext ||
                    courseData.syllabusContext ||
                    "No syllabus context provided",
                  chatData.topic || "No topic",
                  unitIndex,
                  subIndex,
                  typeof subTopic === "string"
                    ? subTopic
                    : subTopic.title || `Subtopic ${subIndex + 1}`,
                  unit.title,
                  unit.unit_num || unitIndex + 1
                ),
              onPlusClick: () =>
                handleSubTopicPlusClick(
                  unitIndex,
                  subIndex,
                  typeof subTopic === "string"
                    ? subTopic
                    : subTopic.title || `Subtopic ${subIndex + 1}`,
                  unit.title,
                  unit.unit_num || unitIndex + 1
                ),
            },
          }); // Edge from unit to subtopic
          edges.push({
            id: `${unitId}-${subTopicId}`,
            source: unitId,
            target: subTopicId,
            type: "default",
            style: {
              stroke: "#10b981",
              strokeWidth: 2,
              strokeDasharray: "3,3",
            },
            animated: true,
          });

          // Create recursive subtopic nodes using hierarchical data
          generateRecursiveSubtopics(
            unitIndex,
            subIndex,
            subTopicId,
            subTopicX,
            subTopicY,
            expandedUnitPosition,
            typeof subTopic === "string"
              ? subTopic
              : subTopic.title || `Subtopic ${subIndex + 1}`,
            unit.title,
            unit.unit_num || unitIndex + 1,
            chatData,
            courseData,
            nodes,
            edges,
            [unitIndex, subIndex], // currentPath
            1, // level
            10, // maxDepth
            totalExpandedUnits // Pass total expanded units for proper spacing
          );
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [chatData, expandedUnits, expandedSubtopicsData, collapsedSubtopics]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when dependencies change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // If no data provided, show placeholder
  if (!chatData) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-semibold text-white mb-2">Mind Map</h3>
          <p className="text-gray-400">No course data available to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh] md:h-full bg-gray-900 rounded-xl overflow-hidden relative flex flex-col">
      {/* General Info Modal */}
      <GeneralInfoModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* Control buttons - Mobile optimized positioning */}
      <div className="absolute top-4 right-4 z-30 flex flex-col sm:flex-row gap-2">
        {/* Cache Statistics Button */}
        {/* <button
          onClick={async () => {
            try {
              const stats = await getCacheStatistics(chatId, user?.uid);
              if (stats.success) {
                // showModal(
                //   "info",
                //   "Cache Statistics",
                //   `Cached Items: ${
                //     stats.data.totalCachedItems
                //   }\nRegular Subtopics: ${
                //     stats.data.regularSubtopics
                //   }\nHierarchical Subtopics: ${
                //     stats.data.hierarchicalSubtopics
                //   }\nCache Size: ${Math.round(
                //     stats.data.totalCacheSize / 1024
                //   )} KB\nOldest: ${
                //     stats.data.oldestCache
                //       ? new Date(stats.data.oldestCache).toLocaleDateString()
                //       : "N/A"
                //   }`
                // );
              }
            } catch (error) {
              console.error("Error fetching cache stats:", error);
            }
          }}
          className="px-3 py-2 sm:px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"
            />
          </svg>
          <span className=" sm:inline">Cache</span>
        </button> */}

        {/* Expansion Statistics Button */}
        <button
          onClick={async () => {
            try {
              const { getExpansionStatistics } = await import("../lib/db");
              const stats = await getExpansionStatistics(chatId, user?.uid);
              if (stats.success) {
                showModal(
                  "info",
                  "Expansion Statistics",
                  `Total Expansions: ${stats.data.totalExpansions}\nMax Depth: ${stats.data.maxDepthReached}\nSubtopics Generated: ${stats.data.totalSubtopicsGenerated}\nContent Generated: ${stats.data.totalContentGenerated}`
                );
              }
            } catch (error) {
              console.error("Error fetching stats:", error);
            }
          }}
          className="px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className=" sm:inline">Stats</span>
        </button>

        {/* Collapse All Button */}
        <button
          onClick={() => {
            // Collapse all expanded subtopics
            const allExpandedKeys = Object.keys(expandedSubtopicsData);
            setCollapsedSubtopics(new Set(allExpandedKeys));
            // showModal(
            //   "info",
            //   "Collapsed All",
            //   "All expanded subtopics have been collapsed. Click the + buttons to expand them again."
            // );
          }}
          className="px-3 py-2 sm:px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
          <span className=" sm:inline">Collapse</span>
        </button>

        <button
          onClick={saveMindmapStateToDb}
          disabled={isLoading || !chatId || !user?.uid}
          className="px-3 py-2 sm:px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Saving...</span>
              <span className="sm:hidden">Save</span>
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="hidden sm:inline">Save State</span>
              <span className="sm:hidden">Save</span>
            </>
          )}
        </button>
        <button
          onClick={resetMindmapToDefault}
          className="px-3 py-2 sm:px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">Reset</span>
          <span className="sm:hidden">Reset</span>
        </button>
      </div>

      <div className="flex-1 w-full h-full">
        <ReactFlow
          ref={reactFlowInstance}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 1.5,
          }}
          attributionPosition="bottom-left"
          className="bg-gray-900 w-full h-full"
          defaultViewport={defaultViewport}
          nodesConnectable={false}
          panOnDrag={true}
          zoomOnPinch={true}
          zoomOnScroll={true}
          panOnScroll={false}
          minZoom={0.1}
          maxZoom={1.5}
        >
          {/* <Controls className="bg-gray-800 border border-gray-600" /> */}
          {/* <MiniMap
            className="bg-gray-800 border border-gray-600"
            nodeColor={(node) => {
              switch (node.type) {
                case "course":
                  return "#fbbf24";
                case "unit":
                  return "#374151";
                case "subtopic":
                  return "#6b7280";
                case "expandedSubtopic":
                  return "#a855f7";
                default:
                  return "#9ca3af";
              }
            }}
          /> */}
          <Background
            color="#374151"
            gap={24}
            size={1}
            className="bg-gray-900 opacity-40"
            variant="dots"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default MindMap;
