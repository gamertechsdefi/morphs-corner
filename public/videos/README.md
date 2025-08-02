# Videos Directory Structure

This directory should contain your video files.

## Expected Structure:
```
public/videos/
├── 01.mov
├── 02.mov
├── 03.mov
├── 04.mov
├── 05.mov
├── 06.mov
├── 07.mov
├── 08.mov
├── 09.mov
├── 10.mov
├── 11.mp4
└── 12.mov
```

## Video File Requirements:
- Format: MP4 or MOV
- Resolution: 1920x1080 or 1280x720 (recommended)
- Codec: H.264

## Adding New Videos:
1. Add your video file to `/public/videos/`
2. Update `/src/data/videos.json` with video details:
   ```json
   {
     "id": "unique-video-id",
     "title": "Your Video Title",
     "description": "Video description",
     "url": "/videos/your-file.mp4",
     "category": "Category"
   }
   ```
3. Use descriptive IDs that work as URL slugs
4. Categories: Education, DeFi, Analysis, Security, Technology, Trading, Development, Gaming

## Video Display:
- No manual thumbnails needed
- System automatically shows video first frame
- Gradient fallback for loading states
- Responsive design across all devices
