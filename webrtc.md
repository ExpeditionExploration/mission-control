gst-launch-1.0 avfvideosrc device-index=0 ! video/x-raw,format=NV12,width=1280,height=720,framerate=30/1 ! videoconvert ! queue ! autovideosink

gst-launch-1.0 videotestsrc ! webrtcsink run-signalling-server=true run-web-server=true web-server-path="dist"

gst-launch-1.0 videotestsrc avfvideosrc device-index=0 ! webrtcsink run-signalling-server=true

WORKS best so far
gst-launch-1.0 avfvideosrc device-index=0 ! videoconvert ! vp8enc deadline=1 ! webrtcsink run-signalling-server=true 

// Seems a bit laggy
gst-launch-1.0 avfvideosrc device-index=0 ! vp9enc ! queue ! webrtcsink run-signalling-server=true 

// Works!!!
gst-launch-1.0 avfvideosrc ! videoconvert ! video/x-raw,format=I420,width=1280,height=720,framerate=30/1 ! queue ! webrtcsink run-signalling-server=true run-web-server=true video-caps="video/x-vp9"

gst-launch-1.0 avfvideosrc device-index=1 ! video/x-raw,format=YUY2,width=1920,height=1080 ! videoconvert ! queue ! webrtcsink run-signalling-server=true video-caps="video/x-vp9"

gst-launch-1.0 avfvideosrc device-index=1 ! video/x-raw,format=YUY2,width=1920,height=1080,framerate=30/1 ! videoconvert ! queue ! autovideosink

 gst-launch-1.0 avfvideosrc device-index=1 ! video/x-raw, format=YUY2, width=3840, height=2160 ! videoconvert ! queue ! autovideosink

gst-launch-1.0 -v avfvideosrc device-index=1 ! videoconvert ! queue ! webrtcsink run-signalling-server=true video-caps="video/x-vp9"

gst-launch-1.0 avfvideosrc device-index=1 ! video/x-raw, format=YUY2, width=1920, height=1080 !

// WORKS at 4K
gst-launch-1.0 -v \
  avfvideosrc device-index=1 ! \
  videoconvert ! \
  vtenc_h264 realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink run-signalling-server=true video-caps="video/x-h264"


gst-launch-1.0 -v \
  avfvideosrc device-index=1 ! \
  videoconvert ! \
  vtenc_h264 realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink run-signalling-server=true video-caps="video/x-vp9"

gst-launch-1.0 -v \
 avfvideosrc device-index=0 ! \
 videoconvert ! \
 vp8enc deadline=1 ! \
 rtpvp8pay ! \
 "application/x-rtp,media=video,encoding-name=VP8,payload=96" ! \
 webrtcsink run-signalling-server=true run-web-server=true

gst-launch-1.0 -v \
  avfvideosrc device-index=1 ! \
  videoconvert ! \
  vtenc_h264 realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink run-signalling-server=true video-caps="video/x-h264"


// 8 May 2025
// Use Mac camera
gst-launch-1.0 -v \
  avfvideosrc device-index=0 ! \
  videoconvert ! \
  vtenc_h264 realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink run-signalling-server=true video-caps="video/x-h264"

gst-launch-1.0 -v \
  avfvideosrc device-index=0 ! \
  videoconvert ! \
  vtenc_h264 realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink video-caps="video/x-h264" run-signalling-server=false

// Use signalling server
gst-launch-1.0 -v \
    videotestsrc ! queue ! vp8enc ! webrtcsink \
      run-signalling-server=false

gst-launch-1.0 -v avfvideosrc device-index=0 ! num-buffers=1 ! filesink location=frame.raw

gst-launch-1.0 avfvideosrc device-index=0 num-buffers=1 ! \
  video/x-raw ! \
  filesink location=frame.raw


  // Seems to capture the best still frame quality
  gst-launch-1.0 avfvideosrc num-buffers=1 ! \
  videoconvert ! video/x-raw ! \
  avenc_bmp ! filesink location=frame.bmp

// Still good and smaller
   gst-launch-1.0 avfvideosrc num-buffers=1 ! \
  videoconvert ! pngenc ! filesink location=frame.png


// 27 May 2025
gst-launch-1.0 -v \
  avfvideosrc device-index=0 ! \
  "video/x-raw(memory:GLMemory)" ! \
  // Use GL pipelines, 
  gldownload ! \
  vtenc_h264_hw realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink run-signalling-server=true video-caps="video/x-h264"

gst-launch-1.0 -v \
  avfvideosrc device-index=0 ! \
  vtenc_h264_hw realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink run-signalling-server=true video-caps="video/x-h264"


gst-launch-1.0 -v \
  avfvideosrc device-index=0 ! \
  "video/x-raw" ! \
  vtenc_h264_hw realtime=true ! \
  queue max-size-buffers=1 leaky=downstream ! \
  webrtcsink run-signalling-server=true video-caps="video/x-h264"