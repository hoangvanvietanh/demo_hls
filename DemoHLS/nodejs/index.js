const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const server = http.createServer((req, res) => {
    // open input stream
let infs = new ffmpeg
let fileName = 'video_sample_2'
let pathFileMp4 = './video/' + fileName + '.mp4'
let pathFolderHls = './video/hls/' + fileName + '/'
let pathFileM3u8 = './video/hls/' + fileName + '/index.m3u8'

if (!fs.existsSync(pathFolderHls)){
    fs.mkdirSync(pathFolderHls, { recursive: true });
}

infs.addInput(pathFileMp4).outputOptions([
    '-map 0:0',
    '-map 0:1',
    '-map 0:0',
    '-map 0:1',
    '-s:v:0 2160x3840',
    '-c:v:0 libx264',
    '-b:v:0 2000k',
    '-s:v:1 960x540',
    '-c:v:1 libx264',
    '-b:v:1 365k',
    // '-var_stream_map', '"v:0,a:0 v:1,a:1"',
    '-master_pl_name master.m3u8',
    '-f hls',
    '-max_muxing_queue_size 1024',
    '-hls_time 1',
    '-hls_list_size 0',
    '-hls_segment_filename', pathFolderHls + 'fileSequence%d.ts'
]).output(pathFileM3u8)
    .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('error', function (err, stdout, stderr) {
        console.log('An error occurred: ' + err.message, err, stderr);
    })
    .on('progress', function (progress) {
        console.log(progress)
        console.log('Processing: ' + progress.percent + '% done')
    })
    .on('end', function (err, stdout, stderr) {
        console.log('Finished processing!' /*, err, stdout, stderr*/)
    })
    .run()

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});