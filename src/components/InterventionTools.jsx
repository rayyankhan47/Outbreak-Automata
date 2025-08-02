import React, { useState } from 'react';
import './InterventionTools.css';

const InterventionTools = ({ onIntervention, isRunning, selectedTool, setSelectedTool }) => {
  const [vaccineSupply, setVaccineSupply] = useState(100);
  const [hospitalCapacity, setHospitalCapacity] = useState(50);

  const tools = [
    {
      id: 'vaccination',
      name: 'Vaccination',
      description: 'Place vaccination centers to create immunity',
      color: '#fbbf24',
      supply: vaccineSupply,
      cost: 1
    },
    {
      id: 'quarantine',
      name: 'Quarantine Zone',
      description: 'Reduce transmission in selected areas',
      color: '#9ca3af',
      supply: '∞',
      cost: 0
    },
    {
      id: 'hospital',
      name: 'Hospital',
      description: 'Increase recovery rates in nearby areas',
      color: '#ffffff',
      supply: hospitalCapacity,
      cost: 1
    }
  ];

  const handleToolSelect = (toolId) => {
    if (selectedTool === toolId) {
      setSelectedTool(null);
    } else {
      setSelectedTool(toolId);
    }
  };

  const handleToolUse = (toolId) => {
    // Reduce supply if not infinite
    if (toolId === 'vaccination') {
      setVaccineSupply(prev => prev - 1);
    } else if (toolId === 'hospital') {
      setHospitalCapacity(prev => prev - 1);
    }
  };

  return (
    <div className="intervention-tools">
      <h3>Intervention Tools</h3>
      <div className="tools-grid">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-button ${selectedTool === tool.id ? 'selected' : ''}`}
            onClick={() => handleToolSelect(tool.id)}
            disabled={isRunning || (tool.supply !== '∞' && tool.supply <= 0)}
          >
            <div 
              className="tool-icon" 
              style={{ backgroundColor: tool.color }}
            ></div>
            <div className="tool-info">
              <div className="tool-name">{tool.name}</div>
              <div className="tool-supply">
                Supply: {tool.supply === '∞' ? '∞' : tool.supply}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {selectedTool && (
        <div className="tool-description">
          <p>{tools.find(t => t.id === selectedTool)?.description}</p>
          <p className="tool-instruction">
            Click on the simulation grid to place {selectedTool}
          </p>
        </div>
      )}
      
      <div className="tool-actions">
        <button 
          className="clear-tool"
          onClick={() => setSelectedTool(null)}
          disabled={!selectedTool}
        >
          Clear Selection
        </button>
        <button 
          className="refill-supply"
          onClick={() => {
            setVaccineSupply(100);
            setHospitalCapacity(50);
          }}
        >
          Refill Supply
        </button>
      </div>
    </div>
  );
};

export default InterventionTools; 