using MongoRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TweetFighter.Models;

namespace TweetFighter.ApplicationCode
{
    public class TweetFightRepository : MongoRepository<TweetFight>
    {
        public List<TweetFight> GetFights()
        {
            var fights = this.All();

            if (fights != null)
            {
                return fights.ToList<TweetFight>();
            }
            else
            {
                return null;
            }
        }

        public List<TweetFight> GetFightsDescending(int howMany)
        {
            var clips = this.All();

            if (clips != null)
            {
                return clips.OrderByDescending(c => c.dateSubmitted).Take(howMany).ToList<TweetFight>();
            }
            else
            {
                return null;
            }
        }
    }
}