interface TwitterWidgets {
  widgets: {
    load: (element?: HTMLElement) => void;
    createTweet: (
      tweetId: string,
      targetEl: HTMLElement,
      options?: Record<string, unknown>
    ) => Promise<void>;
  };
}
export {}

declare global {
  interface TwitterWidgets {
    widgets: {
      load: (element?: HTMLElement) => void;
      createTweet: (
        tweetId: string,
        targetEl: HTMLElement,
        options?: Record<string, unknown>
      ) => Promise<void>;
    };
  }
  interface Window {
    twttr: TwitterWidgets;
  }
}
