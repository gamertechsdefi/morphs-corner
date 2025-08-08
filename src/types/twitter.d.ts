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

declare global {
  interface Window {
    twttr: TwitterWidgets;
  }
}
