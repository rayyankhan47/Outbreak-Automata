import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({ simulationParams, updateParams }) => {
  const handleParamChange = (param, value) => {
    console.log(`Updating ${param} to ${value}`);
    updateParams({ [param]: parseFloat(value) });
  };

  return (
    <div className="control-panel">
      <h3>Simulation Parameters</h3>
      
      <div className="control-group">
        <label>
          Population Density: {(simulationParams.populationDensity * 100).toFixed(0)}%
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.1"
            value={simulationParams.populationDensity}
            onChange={(e) => handleParamChange('populationDensity', e.target.value)}
          />
        </label>
        <span className="help-text">Percentage of cells that contain people</span>
      </div>

      <div className="control-group">
        <label>
          Simulation Speed: {simulationParams.simulationSpeed}x
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={simulationParams.simulationSpeed}
            onChange={(e) => handleParamChange('simulationSpeed', e.target.value)}
          />
        </label>
        <span className="help-text">Speed multiplier (0.1x = slow, 5.0x = fast)</span>
      </div>

      <div className="control-group">
        <label>
          Transmission Rate: {simulationParams.transmissionRate}
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={simulationParams.transmissionRate}
            onChange={(e) => handleParamChange('transmissionRate', e.target.value)}
          />
        </label>
        <span className="help-text">Infected neighbors needed to spread disease</span>
      </div>

      <div className="control-group">
        <label>
          Infection Duration: {simulationParams.infectionDuration}
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={simulationParams.infectionDuration}
            onChange={(e) => handleParamChange('infectionDuration', e.target.value)}
          />
        </label>
        <span className="help-text">Frames before recovery/death</span>
      </div>

      <div className="control-group">
        <label>
          Recovery Rate: {(simulationParams.recoveryRate * 100).toFixed(0)}%
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={simulationParams.recoveryRate}
            onChange={(e) => handleParamChange('recoveryRate', e.target.value)}
          />
        </label>
        <span className="help-text">Probability of recovery vs death</span>
      </div>

      <div className="control-group">
        <label>
          Immunity Duration: {simulationParams.immunityDuration}
          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={simulationParams.immunityDuration}
            onChange={(e) => handleParamChange('immunityDuration', e.target.value)}
          />
        </label>
        <span className="help-text">Frames of immunity after recovery</span>
      </div>

      <div className="control-group">
        <label>
          Mortality Rate: {(simulationParams.mortalityRate * 100).toFixed(0)}%
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={simulationParams.mortalityRate}
            onChange={(e) => handleParamChange('mortalityRate', e.target.value)}
          />
        </label>
        <span className="help-text">Probability of death when infected</span>
      </div>
    </div>
  );
};

export default ControlPanel; 