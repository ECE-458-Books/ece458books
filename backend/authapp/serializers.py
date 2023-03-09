from rest_framework import serializers
from .models import User
from .exceptions import ModifyUserError
from .utils import can_modify

class AdminUserModifySerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'is_staff']

    def validate(self, attrs):
        password = attrs.get('password', None)
        password2 = attrs.get('password2', None)
        
        if (password is not None) and (password2 is not None):
            if password != password2:
                raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def update(self, instance, validated_data):
        """Updates a User."""
        request = self.context['request']
        is_modifiable, error_msg = can_modify(request, instance)

        if not is_modifiable:
            raise ModifyUserError(error_msg)

        # Passwords shouldn't be handled with `setattr` because Django has function for hashing and salting passwords, so do it separately.
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)

        # For keys in the validated data, set them on the current `User`
        for (key, value) in validated_data.items():
            setattr(instance, key, value)

        if password is not None:
            # `.set_password()` handles all security-related tasks. Implemented in super classes
            instance.set_password(password)

        # After finishing this update, must explicitly save the model.
        instance.save()

        return instance

class RegistrationSerializer(serializers.ModelSerializer):
    """Serializers registration requests and creates a new user."""

    # Ensure passwords are at least 8 characters long, no longer than 128
    # characters, and can not be read by the client.
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        # List all of the fields that could possibly be included in a request
        # or response, including fields specified explicitly above.
        fields = ['username', 'password', 'password2', 'is_staff']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # Use the `create_user` method we wrote earlier to create a new user.
        return User.objects.create_user(**validated_data)

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'is_staff'
        ]

class UserSerializer(serializers.ModelSerializer):
    """Handles serialization and deserialization of User objects."""

    password = serializers.CharField(max_length=128, min_length=8, write_only=True)

    class Meta:
        model = User
        fields = [
            'email',
            'username',
            'password',
        ]

    def update(self, instance, validated_data):
        """Updates a User."""

        # Passwords shouldn't be handled with `setattr` because Django has function for hashing and salting passwords, so do it separately.
        password = validated_data.pop('password', None)

        # For keys in the validated data, set them on the current `User`
        for (key, value) in validated_data.items():
            setattr(instance, key, value)

        if password is not None:
            # `.set_password()` handles all security-related tasks. Implemented in super classes
            instance.set_password(password)

        # After finishing this update, must explicitly save the model.
        instance.save()

        return instance

class ChangePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    old_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('old_password', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError({"old_password": "Old password is not correct"})
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data['password'])
        instance.save()

        return instance
