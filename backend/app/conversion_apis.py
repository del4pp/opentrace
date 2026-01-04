import httpx
import json
import hashlib
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class FacebookConversionAPI:
    BASE_URL = "https://graph.facebook.com/v18.0"

    def __init__(self, pixel_id: str, access_token: str):
        self.pixel_id = pixel_id
        self.access_token = access_token

    def _hash_data(self, data: str) -> str:
        return hashlib.sha256(data.lower().encode()).hexdigest()

    async def send_conversion(self, event_name: str, user_data: Dict[str, Any], custom_data: Optional[Dict[str, Any]] = None) -> bool:
        try:
            hashed_user_data = {}
            if 'email' in user_data:
                hashed_user_data['em'] = [self._hash_data(user_data['email'])]
            if 'phone' in user_data:
                hashed_user_data['ph'] = [self._hash_data(user_data['phone'])]
            if 'ip' in user_data:
                hashed_user_data['client_ip_address'] = user_data['ip']
            if 'user_agent' in user_data:
                hashed_user_data['client_user_agent'] = user_data['user_agent']

            event_data = {
                "event_name": event_name,
                "event_time": int(datetime.utcnow().timestamp()),
                "user_data": hashed_user_data,
                "event_source_url": user_data.get('url', ''),
                "action_source": "website"
            }

            # Add external ID for better attribution
            if user_data.get('session_id'):
                event_data["custom_data"] = event_data.get("custom_data", {})
                event_data["custom_data"]["external_id"] = user_data['session_id']

            if custom_data:
                event_data["custom_data"] = custom_data

            # Add click tracking if available
            if user_data.get('fbclid'):
                event_data["custom_data"] = event_data.get("custom_data", {})
                event_data["custom_data"]["fbclid"] = user_data['fbclid']

            payload = {
                "data": [event_data],
                "access_token": self.access_token
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/{self.pixel_id}/events",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )

                if response.status_code == 200:
                    logger.info(f"Facebook conversion sent: {event_name}")
                    return True
                else:
                    logger.error(f"Facebook API error: {response.text}")
                    return False

        except Exception as e:
            logger.error(f"Facebook conversion failed: {e}")
            return False

class TikTokConversionAPI:
    BASE_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track"

    def __init__(self, pixel_code: str, access_token: str):
        self.pixel_code = pixel_code
        self.access_token = access_token

    def _hash_data(self, data: str) -> str:
        return hashlib.sha256(data.lower().encode()).hexdigest()

    async def send_conversion(self, event_name: str, user_data: Dict[str, Any], custom_data: Optional[Dict[str, Any]] = None) -> bool:
        try:
            context = {}
            if 'email' in user_data:
                context['user'] = context.get('user', {})
                context['user']['email'] = self._hash_data(user_data['email'])
            if 'phone' in user_data:
                context['user'] = context.get('user', {})
                context['user']['phone_number'] = self._hash_data(user_data['phone'])
            if 'ip' in user_data:
                context['ip'] = user_data['ip']
            if 'user_agent' in user_data:
                context['user_agent'] = user_data['user_agent']
            if 'url' in user_data:
                context['url'] = user_data['url']

            payload = {
                "pixel_code": self.pixel_code,
                "event": event_name,
                "timestamp": datetime.utcnow().isoformat(),
                "context": context
            }

            # Add external ID for better attribution
            if user_data.get('session_id'):
                payload["properties"] = payload.get("properties", {})
                payload["properties"]["external_id"] = user_data['session_id']

            if custom_data:
                payload["properties"] = custom_data

            # Add click tracking if available
            if user_data.get('ttclid'):
                payload["properties"] = payload.get("properties", {})
                payload["properties"]["ttclid"] = user_data['ttclid']

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.BASE_URL,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Access-Token": self.access_token
                    }
                )

                if response.status_code == 200:
                    logger.info(f"TikTok conversion sent: {event_name}")
                    return True
                else:
                    logger.error(f"TikTok API error: {response.text}")
                    return False

        except Exception as e:
            logger.error(f"TikTok conversion failed: {e}")
            return False

async def process_event_actions(event_name: str, user_data: Dict[str, Any], actions_config: list):
    results = []

    for action_config in actions_config:
        if not action_config.get('is_active', True):
            continue

        action_type = action_config['action_type']
        config = json.loads(action_config['config'])

        try:
            if action_type == 'facebook_conversion':
                fb_api = FacebookConversionAPI(
                    pixel_id=config['pixel_id'],
                    access_token=config['access_token']
                )
                success = await fb_api.send_conversion(
                    event_name,
                    user_data,
                    config.get('custom_data')
                )
                results.append({'type': 'facebook', 'success': success})

            elif action_type == 'tiktok_conversion':
                tt_api = TikTokConversionAPI(
                    pixel_code=config['pixel_code'],
                    access_token=config['access_token']
                )
                success = await tt_api.send_conversion(
                    event_name,
                    user_data,
                    config.get('custom_data')
                )
                results.append({'type': 'tiktok', 'success': success})

        except Exception as e:
            logger.error(f"Action processing failed for {action_type}: {e}")
            results.append({'type': action_type, 'success': False, 'error': str(e)})

    return results
