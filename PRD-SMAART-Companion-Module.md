# SMAART Companion Module PRD

## Overview
A Bitfocus Companion module that integrates with SMAART's API to display real-time Leq (Equivalent Continuous Sound Level) measurements on Companion buttons.

## Business Requirements
1. Enable audio engineers to monitor SMAART Leq measurements directly from their Stream Deck
2. Provide simple, at-a-glance Leq readings without needing to reference the SMAART interface
3. Streamline live sound monitoring workflow

## Technical Requirements

### Core Functionality
1. Connect to SMAART API
   - Establish and maintain WebSocket connection
   - Handle connection status and reconnection
   - Authenticate if required by the API

2. Data Polling
   - Poll SMAART API for Leq measurements
   - Configure polling interval (default: 500ms)
   - Handle data parsing and validation

3. Button Display
   - Show current Leq value
   - Update button text dynamically
   - Optional: Color coding based on Leq thresholds

### Module Configuration
1. Connection Settings
   - SMAART API endpoint/IP address
   - Port number
   - Authentication credentials (if required)

2. Display Options
   - Update frequency
   - Decimal precision
   - Warning thresholds (optional)
   - Button styling preferences
   - Leq time window selection

### Actions
1. Start/Stop Monitoring
2. Reset Connection
3. Change Measurement Source
4. Adjust Leq Time Window

### Feedbacks
1. Connection Status
2. Leq Value Display
3. Threshold Warnings (optional)

## User Interface
1. Button Display Format:
   ```
   [Leq]
   XX.X dBA
   ```
2. Configuration Panel:
   - Connection settings
   - Display preferences
   - Threshold settings
   - Leq time window settings

## Error Handling
1. Connection failure recovery
2. Invalid data handling
3. User-friendly error messages

## Testing Requirements
1. Connection stability
2. Data accuracy verification
3. Performance under various network conditions
4. Button update responsiveness

## Future Enhancements (v2+)
1. Support for multiple measurement points
2. Historical data logging
3. Additional metrics (dBC, instantaneous SPL, etc.)
4. Custom alert thresholds
5. Graph visualization options
6. Multiple Leq time windows simultaneously

## Dependencies
1. Bitfocus Companion SDK
2. SMAART API access
3. WebSocket support
4. Node.js runtime

## Delivery Timeline
1. Phase 1: Basic Leq Display (2 weeks)
2. Phase 2: Enhanced Features (2 weeks)
3. Phase 3: Testing & Documentation (1 week)
4. Phase 4: Release & Deployment (1 week)

## Success Metrics
1. Stable connection maintenance
2. Accurate Leq readings
3. Button update latency < 100ms
4. Positive user feedback
5. Minimal resource usage 