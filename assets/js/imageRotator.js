document.addEventListener('DOMContentLoaded', function() {
    const youtubeFrame = document.getElementById('youtubeFrame');
    const fullScreenBtn = document.getElementById('fullScreenBtn');

    // **แทนที่ YOUR_GOOGLE_DRIVE_VIDEO_ID ด้วย ID ของวิดีโอที่คุณคัดลอกมา**
    const googleDriveVideoID = '1JCOSghPnf5j5fK-VfPKbZvBuKmNSyx2E';

    // สร้าง URL สำหรับการ embed วิดีโอจาก Google Drive
    // ลบ autoplay=1 ออกเพื่อให้วิดีโอไม่เล่นอัตโนมัติ
    const googleDriveEmbedURL = `https://drive.google.com/file/d/${googleDriveVideoID}/preview`;

    // ตั้งค่า src ของ iframe ให้เป็น URL ของ Google Drive
    youtubeFrame.src = googleDriveEmbedURL;

    // ปุ่มขยายเต็มจอ
    fullScreenBtn.addEventListener('click', function() {
        if (youtubeFrame.requestFullscreen) {
            youtubeFrame.requestFullscreen();
        } else if (youtubeFrame.mozRequestFullScreen) { /* Firefox */
            youtubeFrame.mozRequestFullScreen();
        } else if (youtubeFrame.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            youtubeFrame.webkitRequestFullscreen();
        } else if (youtubeFrame.msRequestFullscreen) { /* IE/Edge */
            youtubeFrame.msRequestFullscreen();
        }
    });
});