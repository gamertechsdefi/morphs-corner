interface TwitterWidgets {
  widgets: {
    load: (element?: HTMLElement) => void;
    createTweet: (
      tweetId: string,
      targetEl: HTMLElement,
      options?: Record<string, any>
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
        options?: Record<string, any>
      ) => Promise<void>;
    };
  }
  interface Window {
    twttr: TwitterWidgets;
  }
}
