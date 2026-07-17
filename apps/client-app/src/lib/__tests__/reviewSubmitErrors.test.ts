import { ApiBusinessError, HttpError, MalformedResponseError, NetworkError } from '../http';
import { reviewErrorMessage } from '../reviewSubmitErrors';

const labels = {
  ctaSignIn: 'Sign in to rate',
  errorGeneric: 'Could not submit your review. Try again.',
  errorVelocity: 'Too many reviews today.',
  errorComment: 'Comment rejected.',
  errorRateLimited: 'Slow down.',
  errorAlready: 'Already rated.',
  errorUnavailable: 'Ratings are temporarily unavailable.',
  errorNeedContact: 'Contact this provider by phone or WhatsApp before rating.',
  errorReviewTooSoon: 'You just contacted them — wait a few seconds before rating.',
  errorSelfRating: 'You cannot rate your own listing.',
  connectionMessage: 'Connection problem.',
};

describe('reviewErrorMessage', () => {
  it('maps known business codes', () => {
    expect(reviewErrorMessage(new HttpError(409, 'x', 'ALREADY_RATED'), labels)).toBe(
      labels.errorAlready,
    );
    expect(reviewErrorMessage(new HttpError(429, 'x', 'REVIEW_VELOCITY_LIMITED'), labels)).toBe(
      labels.errorVelocity,
    );
    expect(reviewErrorMessage(new HttpError(400, 'x', 'COMMENT_REJECTED'), labels)).toBe(
      labels.errorComment,
    );
    expect(reviewErrorMessage(new HttpError(429, 'x', 'IP_RATE_LIMITED'), labels)).toBe(
      labels.errorRateLimited,
    );
    expect(reviewErrorMessage(new HttpError(403, 'x', 'SELF_RATING_FORBIDDEN'), labels)).toBe(
      labels.errorSelfRating,
    );
  });

  it('maps 401 to Sign in for any session (never customer-account prompt)', () => {
    expect(
      reviewErrorMessage(new HttpError(401, 'Verify your phone', 'UNAUTHORIZED'), labels, {
        activeSession: 'provider',
      }),
    ).toBe(labels.ctaSignIn);
    expect(
      reviewErrorMessage(new HttpError(401, 'Verify your phone', 'UNAUTHORIZED'), labels, {
        activeSession: 'customer',
      }),
    ).toBe(labels.ctaSignIn);
  });

  it('maps the restored contact-gate codes to their own copy (not generic)', () => {
    expect(
      reviewErrorMessage(new HttpError(403, 'x', 'NEED_CONTACT'), labels),
    ).toBe(labels.errorNeedContact);
    expect(
      reviewErrorMessage(new HttpError(429, 'x', 'REVIEW_TOO_SOON'), labels),
    ).toBe(labels.errorReviewTooSoon);
  });

  it('maps production catch-all 404 / NOT_FOUND to unavailable (not generic)', () => {
    expect(
      reviewErrorMessage(
        new HttpError(404, 'Endpoint does not exist on this server.', 'NOT_FOUND'),
        labels,
      ),
    ).toBe(labels.errorUnavailable);
    expect(reviewErrorMessage(new HttpError(404, 'missing'), labels)).toBe(labels.errorUnavailable);
    expect(reviewErrorMessage(new HttpError(501, 'not implemented'), labels)).toBe(
      labels.errorUnavailable,
    );
  });

  it('maps network + malformed without leaking internals', () => {
    expect(reviewErrorMessage(new NetworkError('offline'), labels)).toBe(labels.connectionMessage);
    expect(reviewErrorMessage(new MalformedResponseError(), labels)).toBe(labels.errorGeneric);
  });

  it('prefers a safe server message over generic when useful', () => {
    expect(
      reviewErrorMessage(
        new HttpError(500, 'Could not submit your review.', 'REVIEW_CREATE_FAILED'),
        labels,
      ),
    ).toBe('Could not submit your review.');
    expect(
      reviewErrorMessage(new ApiBusinessError('Please pick a rating between 1 and 5.', 'VALIDATION_ERROR'), labels),
    ).toBe('Please pick a rating between 1 and 5.');
  });

  it('ignores technical server messages', () => {
    expect(
      reviewErrorMessage(
        new HttpError(500, 'column "customer_id" of relation does not exist', 'REVIEW_CREATE_FAILED'),
        labels,
      ),
    ).toBe(labels.errorGeneric);
  });
});
