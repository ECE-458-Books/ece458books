from .models import Book, BookImage

class BookImageCreator:
    def has_image_bytes(self, request):
        return request.FILES.get('image_bytes', None) is not None

    def has_image_url(self, request):
        return request.data.get('image_url', None) is not None

    def bookimage_get_and_create(self, request, isbn_13, setDefaultImage):
        book = Book.objects.filter(isbn_13=isbn_13)

        # This creates an image in static and sends a file
        if setDefaultImage:
            url = self.isbn_toolbox.get_default_image_url()
        elif self.has_image_bytes(request):
            url = self.isbn_toolbox.commit_image_raw_bytes(request, book[0].id, isbn_13)
        elif self.has_image_url(request):
            url = self.isbn_toolbox.commit_image_url(request, book[0].id, isbn_13)
        else:
            url = self.isbn_toolbox.get_default_image_url()

        obj, created = BookImage.objects.get_or_create(
            book_id=book[0].id,
            defaults={'image_url': url},
        )

        # We need to patch the url if it is a get
        if not created:
            obj.image_url = url
            obj.save()

        return url
