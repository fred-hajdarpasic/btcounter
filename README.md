##Installation
    npx react-native init btcounter --template react-native-template-typescript
    cd btcounter
    npx react-native start --reset-cache
    cd btcounter
    npx react-native run-android

## Configuration
    npm install react-native-ble-manager

## Simulation
    App: BluetoothTool => Periphera mode: 
    - Device name 'CC2650 SensorTag'
    - Service name UUID: FFE0
    - Characteristic notice UUID: FFE1
    - Data send: 11
    - Click on 'Advertising'
    - Then keep clicking on 'Send Notice' to simluate a trigger.