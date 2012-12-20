using MongoRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TweetFighter.Models
{

    public class TweetFight : Entity
    {

        public FightEntry firstEntry { get; set; }
        public FightEntry secondEntry { get; set; }
        public DateTime dateSubmitted { get; set; }
    }

    public class FightEntry : Entity
    {
        public String searchTerm { get; set; }
        public String totalTweets { get; set; }
        public DateTime oldestTweetDate { get; set; }
        public double tweetsPerMinute { get; set; }
        public Boolean winner { get; set; }
        
    }

}