from utils.general import str2bool

def can_modify(request, instance):
    modifying_user = request.user.username
    modified_user = instance.username

    modified_user_is_staff = instance.is_staff
    modifying_user_is_staff = str2bool(request.data.get('is_staff', 'true'))

    if modified_user == 'admin' and modifying_user_is_staff == False:
        return False, "Cannot change admin(SuperUser) account privileges"
    
    if modified_user_is_staff and modifying_user == modified_user and modified_user_is_staff != modifying_user_is_staff:
        return False, "Cannot change self account privileges"
    
    # if modified_user_is_staff and modifying_user != 'admin':
    #     return False, "Cannot change other administrator accounts. Only admin (SuperUser) has the rights"

    return True, ''