// Transactional email uses HTTPS, including hosts where outbound SMTP is blocked.
function configured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RECOVERY_MAIL_FROM);
}
async function sendCode(email, code) {
  if (!configured()) throw new Error('MAIL_UNAVAILABLE');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.RECOVERY_MAIL_FROM, to: [email],
      subject: 'Mã khôi phục mật khẩu Tháp Tri Thức',
      text: `Mã khôi phục mật khẩu của bạn: ${code}\nMã có hiệu lực 10 phút, chỉ dùng một lần. Không chia sẻ mã này. Nếu bạn không yêu cầu, hãy bỏ qua thư.` })
  });
  if (!response.ok) throw new Error('MAIL_DELIVERY_FAILED');
}
module.exports = { configured, sendCode };
