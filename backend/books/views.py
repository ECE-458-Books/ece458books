from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions, status
import re
from .isbn import ISBNSearch

class ISBNSearchView(APIView):
    search = ISBNSearch()

    def get(self, request):
        req_dict = request.data
        if "isbns" in req_dict:
            isbns = re.split("\s?[, ]\s?", req_dict['isbns'].strip())
        else:
            return Response({"details":"Please Include 'isbns' Field to JSON Request"}, status=status.HTTP_400_BAD_REQUEST)

        response_list = []

        for isbn in isbns:
            response_list.append(self.search.fecth_isbn_data(isbn))
        
        return Response(response_list)

