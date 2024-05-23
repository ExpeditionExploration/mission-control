# Drift
- I've been struggling with the end points drifting over time. I think I found the cause and that is that I had not correctly implemented the half step. Or rather I had incorrectly implemented the full drive step, and accidentally half implemented half step.
https://www.monolithicpower.com/bipolar-stepper-motors-part-i-control-modes
https://www.automate.org/case-studies/what-is-the-difference-between-full-stepping-the-half-stepping-and-the-micro-drive

