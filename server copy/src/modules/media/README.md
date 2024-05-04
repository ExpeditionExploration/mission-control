# Video

-   Set video device 4 to 4k or max res `v4l2-ctl -d4 -v width=3840,height=2160,pixelformat=MJPG -V`
-   Get the mjpeg stream to stdout `v4l2-ctl -d4 --stream-mmap --stream-to -`
-   https://manpages.debian.org/unstable/v4l-utils/v4l2-ctl.1.en.html
-   Get the device details for video3 `sudo v4l2-ctl -d3 -V`

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

User Controls

                     brightness 0x00980900 (int)    : min=-64 max=64 step=1 default=-5 value=-5
                       contrast 0x00980901 (int)    : min=0 max=95 step=1 default=1 value=1
                     saturation 0x00980902 (int)    : min=0 max=100 step=1 default=64 value=64
                            hue 0x00980903 (int)    : min=-2000 max=2000 step=1 default=0 value=0
        white_balance_automatic 0x0098090c (bool)   : default=1 value=1
                          gamma 0x00980910 (int)    : min=100 max=300 step=1 default=100 value=100
           power_line_frequency 0x00980918 (menu)   : min=0 max=2 default=1 value=1
      white_balance_temperature 0x0098091a (int)    : min=2800 max=6500 step=1 default=4600 value=4600 flags=inactive
                      sharpness 0x0098091b (int)    : min=1 max=7 step=1 default=2 value=2
         backlight_compensation 0x0098091c (int)    : min=0 max=6 step=1 default=4 value=4

Camera Controls

                  auto_exposure 0x009a0901 (menu)   : min=0 max=3 default=3 value=3
         exposure_time_absolute 0x009a0902 (int)    : min=3 max=2047 step=1 default=166 value=166 flags=inactive
                 focus_absolute 0x009a090a (int)    : min=0 max=1023 step=1 default=0 value=470 flags=inactive
     focus_automatic_continuous 0x009a090c (bool)   : default=0 value=1
                  zoom_absolute 0x009a090d (int)    : min=0 max=60 step=1 default=0 value=0
