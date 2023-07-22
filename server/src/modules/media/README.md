# Video
- Set video device 4 to 4k or max res `v4l2-ctl -d4 -v width=3840,height=2160,pixelformat=MJPG -V`
- Get the mjpeg stream to stdout `v4l2-ctl -d4 --stream-mmap --stream-to -`
- https://manpages.debian.org/unstable/v4l-utils/v4l2-ctl.1.en.html
- Get the device details for video3 `sudo v4l2-ctl -d3 -V`

// to get a list of available devices
// v4l2-ctl --list-devices

// to set the device
// v4l2-ctl --device=/dev/video0

// to get a list of available formats
// v4l2-ctl --list-formats-ext

// to set the format
// v4l2-ctl --set-fmt-video=width=640,height=480,pixelformat=1

// to get a list of available frame sizes
// v4l2-ctl --list-sizes

// to set the frame size
// v4l2-ctl --set-fmt-video=width=640,height=480

// to get a list of available frame intervals
// v4l2-ctl --list-frameintervals

// to set the frame interval
// v4l2-ctl --set-parm=30

// to get the current settings
// v4l2-ctl --all

// to get a list of available controls
// v4l2-ctl --list-ctrls

// to set a control
// v4l2-ctl --set-ctrl=exposure_auto=1,exposure_absolute=