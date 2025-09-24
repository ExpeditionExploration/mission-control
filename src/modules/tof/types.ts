
type TargetData = {
    targetStatus: number,
    distanceMillimeters: number,
    signalPerSpad: number,
    rangeSigmaMillimeters: number,
}

export type TOFZone = {
    zoneIndex: number,
    distanceMillimeters: number,
    status: number,
    nbTargetDetected: number,
    ambientPerSpad: number,
    nbSpadsEnabled: number,
    targetData: TargetData[]
}