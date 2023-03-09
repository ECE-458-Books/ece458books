
def can_modify(request, instance):
    modifying_user = request.user.username
    modified_user = instance.username
    modified_user_is_staff = instance.is_staff

    if modified_user == 'admin':
        return False, "Cannot change admin(SuperUser) account privileges"

    if modifying_user == modified_user:
        return False, "Cannot change self account privileges"
    
    if modified_user_is_staff and modifying_user != 'admin':
        return False, "Cannot change other administrator accounts. Only admin (SuperUser) has the rights"

    return True, ''