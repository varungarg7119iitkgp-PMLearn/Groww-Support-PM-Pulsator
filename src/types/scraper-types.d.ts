declare module "google-play-scraper" {
  interface ReviewsOptions {
    appId: string;
    sort?: number;
    num?: number;
    paginate?: boolean;
    nextPaginationToken?: string | null | undefined;
  }

  interface ReviewData {
    id: string;
    userName: string;
    score: number;
    text: string;
    date: string;
    thumbsUp: number;
    version: string;
  }

  interface ReviewsResult {
    data: ReviewData[];
    nextPaginationToken?: string | null;
  }

  const sort: { NEWEST: number; RATING: number; HELPFULNESS: number };

  function reviews(options: ReviewsOptions): Promise<ReviewsResult>;

  export default { reviews, sort };
}

declare module "app-store-scraper" {
  interface ReviewsOptions {
    id: number;
    sort?: number;
    page?: number;
    country?: string;
  }

  interface ReviewData {
    id: string;
    userName: string;
    score: number;
    text: string;
    title: string;
    date: string;
    version: string;
  }

  const sort: { RECENT: number; HELPFUL: number };

  function reviews(options: ReviewsOptions): Promise<ReviewData[]>;

  export default { reviews, sort };
}
