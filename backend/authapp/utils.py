from utils.general import str2bool

from .exceptions import ModifyUserError

def check_administrator_modify_restrictions(request, instance):
    """
    Checks if administrators are able to modify certain privileges of other administrator accounts

    Cases
    1. username admin (different from normal administrator accounts) privileges cannot be taken away
    2. administrators cannot take away their own privileges
    """
    modifying_user = request.user.username
    modified_user = instance.username

    modifying_user_is_staff = str2bool(request.data.get('is_staff', 'true'))

    # Case 1
    if modified_user == 'admin' and modifying_user_is_staff == False:
        error_msg = "Cannot modify admin(SuperUser) account privileges"
        raise ModifyUserError(error_msg)
    
    # Case 2
    if modifying_user == modified_user and modifying_user_is_staff == False:
        error_msg = "Cannot modify self account privileges"
        raise ModifyUserError(error_msg)

def check_administrator_delete_restrictions(request, instance):
    """
    Checks if administrators are able to delete other administrator accounts

    Requirements:
        Administrators will be able to delete user accounts other than their own
        account and the admin account.

    Cases
    1. cannot delete admin account
    2. administrators cannot delete their own account
    """
    modifying_user = request.user.username
    modified_user = instance.username

    # Case 1
    if modified_user == 'admin':
        error_msg = "Cannot delete admin(SuperUser)"
        raise ModifyUserError(error_msg)
    
    # Case 2
    if modifying_user == modified_user:
        error_msg = "Cannot delete own account"
        raise ModifyUserError(error_msg)

    