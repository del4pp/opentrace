import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import subprocess
import logging
import asyncio

logger = logging.getLogger(__name__)

def send_email_via_smtp(to_email: str, subject: str, body: str, config: dict = None) -> bool:
    try:
        if not config:
            config = {
                "host": "localhost",
                "port": 25,
                "user": "",
                "password": "",
                "from_email": "noreply@localhost"
            }
        
        msg = MIMEMultipart()
        msg['From'] = config.get("from_email", "noreply@localhost")
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        host = config.get("host", "localhost")
        port = int(config.get("port", 25))
        
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=30)
        else:
            server = smtplib.SMTP(host, port, timeout=30)
        
        server.set_debuglevel(0)
        
        if port == 587:
            server.starttls()
            
        user = config.get("user")
        password = config.get("password")
        if user and password:
            server.login(user, password)
            
        server.sendmail(config.get("from_email", "noreply@localhost"), to_email, msg.as_string())
        server.quit()

        logger.info(f"Email sent successfully to {to_email} via {host}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP ({config.get('host')}): {str(e)}")
        return False

def send_email_via_mail_command(to_email: str, subject: str, body: str, from_email: str = "noreply@localhost") -> bool:
    try:
        email_content = f"Subject: {subject}\nFrom: {from_email}\nTo: {to_email}\n\n{body}"

        result = subprocess.run(
            ['mail', '-s', subject, to_email],
            input=email_content,
            text=True,
            capture_output=True,
            timeout=30
        )

        if result.returncode == 0:
            logger.info(f"Email sent successfully to {to_email} via mail command")
            return True
        else:
            logger.error(f"Mail command failed: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        logger.error("Mail command timed out")
        return False
    except FileNotFoundError:
        logger.error("Mail command not found on system")
        return False
    except Exception as e:
        logger.error(f"Failed to send email via mail command: {e}")
        return False

async def send_email(to_email: str, subject: str, body: str, config: dict = None) -> bool:
    loop = asyncio.get_event_loop()

    try:
        smtp_result = await loop.run_in_executor(
            None, send_email_via_smtp, to_email, subject, body, config
        )
        if smtp_result:
            return True
    except Exception as e:
        logger.error(f"SMTP execution error: {e}")

    try:
        # Mail command usually doesn't need custom SMTP config
        from_email = config.get("from_email", "noreply@localhost") if config else "noreply@localhost"
        mail_result = await loop.run_in_executor(
            None, send_email_via_mail_command, to_email, subject, body, from_email
        )
        if mail_result:
            return True
    except Exception as e:
        logger.error(f"Mail command execution error: {e}")

    logger.error(f"All email sending methods failed for {to_email}")
    return False
