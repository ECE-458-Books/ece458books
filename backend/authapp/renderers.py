import json
from rest_framework.renderers import JSONRenderer

class UserJSONRenderer(JSONRenderer):
    charset = 'utf-8'
    def render(self, data, media_type=None, renderer_context=None):
        token = data.get('token', None)

        # Handle rendering of errors if they exist
        errors = data.get('errors', None)
        if errors is not None:
            return super(UserJSONRenderer, self).render(data)

        if (token is not None and isinstance(token, bytes)):
            data['token'] = token.decode(charset)

        return json.dumps({
            'user': data
        })
