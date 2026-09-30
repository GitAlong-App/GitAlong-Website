/** FAQ content shared by the landing page and /faq (also emitted as FAQPage JSON-LD). */
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: 'What is GitAlong?',
    answer:
      'GitAlong matches developers with collaborators. You say why you are here (a co-founder, a side-project partner, open-source collaborators, hackathon teammates, someone to mentor or a mentor), what you are building and which skills you want in a partner. GitAlong recommends people whose intent fits yours and who have those skills, and shows you their real GitHub work.',
  },
  {
    question: 'How does matching work?',
    answer:
      'Recommendations are ranked on compatible intent (co-founder with co-founder, mentor with mentee), complementary skills (they know what you are looking for, or the other way round), shared languages and interests, and GitHub activity. Each card shows the reasons, for example “You’re both looking for a co-founder” or “Knows TypeScript — a skill you want”.',
  },
  {
    question: 'When can I message someone?',
    answer:
      'When you both swipe right, it is a match and a chat opens. You can chat on the website (Messages) or in the Android app — it is the same conversation.',
  },
  {
    question: 'What are streaks, XP and achievements?',
    answer:
      'Small nudges to keep you going. Reviewing builders or sending a message on a day keeps your streak alive, the daily goal is reviewing 10 builders, and you earn XP and achievements for real activity like matches and conversations. They are computed from what you actually do in GitAlong and are the same on the web and in the app.',
  },
  {
    question: 'What data do you use from GitHub?',
    answer:
      'Your public GitHub profile (username, name, avatar, bio, location, company, follower counts) and metadata about your public repositories (languages, topics, stars). Sign-in asks for the read:user and user:email scopes. GitAlong does not read private repositories or your code, and never stores your GitHub password.',
  },
  {
    question: 'Who can see my email address?',
    answer: 'Nobody but you. Other developers only see your public profile, never your email.',
  },
  {
    question: 'Is there a mobile app?',
    answer:
      'Yes — an Android beta, available as an APK from our GitHub releases. It is not in Google Play yet. The iOS app is coming later. Your account works on the web and on Android.',
  },
  {
    question: 'How do I block or report someone?',
    answer:
      'Open the conversation, tap the ⋮ menu and choose Unmatch, Block or Report. Blocking hides you from each other and ends the match. Reports are private and reviewed for safety.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Go to Settings → Account → Delete account on the website, or use the delete option in the Android app. This permanently deletes your profile, swipes, matches and messages.',
  },
  {
    question: 'Does GitAlong cost anything?',
    answer: 'No. GitAlong is free to use.',
  },
];
