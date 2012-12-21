using MongoRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TweetFighter.Models;

namespace TweetFighter.ApplicationCode
{
    //This is the responsitory to handle all of the mongodb connectivity. 
    public class TweetFightRepository : MongoRepository<TweetFight>
    {

        //Get the last N number of previous fights. 
        public List<TweetFight> GetPreviousFightsDescending(int howMany)
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