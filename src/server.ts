import app from './app';
import { seedBadges } from './services/badge.service';
import { initBadgeJobs } from './jobs/badgeJob';
import { initRetryJob } from './jobs/retryJob';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  
  // Rozet tanımlarını kontrol et/ekle
  await seedBadges();
  
  // Cron jobları başlat
  initBadgeJobs();
  initRetryJob();
});
