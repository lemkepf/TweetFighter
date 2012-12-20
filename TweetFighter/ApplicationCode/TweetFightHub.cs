using AutoMapper;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using TweetFighter.Models;

namespace TweetFighter.ApplicationCode
{
    //This is signalr's main hub. It listens for new things like "adding a fight entry". 
    //It will then call out to all other clients that they have new entries. Slick eh?

    [HubName("tweetFightHub")]
    public class TweetFightHub : Hub
    {
        //Here is the data storage of all fights. It will store this eventually in MongoDB. 
        //using the respository pattern you have no need to know the backend data store. Cool. 
        static TweetFightRepository db = new TweetFightRepository();

        //client said they added a new fight entry
        public void addFightEntry(TweetFightPOCO newFight)
        {
            if (newFight != null)
            {
                //map FightPOCO to db entity 
                //Explanation below
                TweetFight newFightEntity = Mapper.Map<TweetFightPOCO, TweetFight>(newFight);

                db.Add(newFightEntity);

                //notify everyone that we have a new fight entry
                Clients.All.newFightEntry(newFight);

            }
        }

    }

    //This is some trickery to deal with SignalR not liking a non-POCO object. 
    //TweetFight inherits "Entity" so that it can be used in the mongo repository pattern
    //I created a POCO version to remove that. 
    //I could refactor this to "fix" the issue, but I get to show off using AutoMapper instead. 
    public class TweetFightPOCO
    {

        public FightEntryPOCO firstEntry { get; set; }
        public FightEntryPOCO secondEntry { get; set; }
        public DateTime dateSubmitted { get; set; }
    }

    public class FightEntryPOCO
    {
        public String searchTerm { get; set; }
        public String totalTweets { get; set; }
        public DateTime oldestTweetDate { get; set; }
        public double tweetsPerMinute { get; set; }
        public Boolean winner { get; set; }

    }
}