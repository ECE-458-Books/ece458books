from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializers registration requests and creates a new user."""

    # Ensure passwords are at least 8 characters long, no longer than 128
    # characters, and can not be read by the client.
    password = serializers.CharField(max_length=128, min_length=8, write_only=True)

    # The client should not be able to send a token along with a registration
    # request. Making `token` read-only handles that for us.
    token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = User
        # List all of the fields that could possibly be included in a request
        # or response, including fields specified explicitly above.
        fields = ['email', 'username', 'password', 'token']

    def create(self, validated_data):
        # Use the `create_user` method we wrote earlier to create a new user.
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=255)
    username = serializers.CharField(max_length=255, read_only=True)
    password = serializers.CharField(max_length=128, write_only=True)
    token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        '''
        In this method we ensure the current LoginSerializer has instace of 'valid', meaning that for loggin in a user, validating that the user has provided an email and password that matches a user in the database.
        '''
        email = data.get('email', None)
        password = data.get('password', None)

        if email is None:
            raise serializers.ValidationError('An email address is required to log in.')

        if password is None:
            raise serializers.ValidationError('A password is required to log in.')

        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError('No user found with this email and password.')

        # Django has a flag on user that says if it has been banned or deactivated, which will almost never be the case, but doesn't hurt to check.
        if not user.is_active:
            raise serializers.ValidationError('This user has been deactivated.')

        return {'email': user.email, 'username': user.username, 'token': user.token}


class UserSerializer(serializers.ModelSerializer):
    """Handles serialization and deserialization of User objects."""

    password = serializers.CharField(max_length=128, min_length=8, write_only=True)

    class Meta:
        model = User
        fields = (
            'email',
            'username',
            'password',
            'token',
        )

        # Same as doing 'read_only = True', just for 'token' we aren't specifying anything else about it like we do with 'password' above
        read_only_fields = ('token',)

    def update(self, instance, validated_data):
        """Updates a User."""

        # Passwords shouldn't be handled with `setattr` because Django has function for hashing and salting passwords, so do it separately.
        password = validated_data.pop('password', None)

        # For keys in the validated data, set them on the current `User`
        for (key, value) in validated_data.items():
            setattr(instance, key, value)

        if password is not None:
            # `.set_password()` handles all security-related tasks.
            instance.set_password(password)

        # After finishing this update, must explicitly save the model.
        instance.save()

        return instance
