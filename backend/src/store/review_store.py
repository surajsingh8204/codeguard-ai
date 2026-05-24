class ReviewStore:

    latest_review = None

    @classmethod
    def save_review(cls, review):

        cls.latest_review = review

    @classmethod
    def get_review(cls):

        return cls.latest_review
