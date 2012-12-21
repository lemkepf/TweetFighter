using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TweetFighter.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/

        public ActionResult Index()
        {
            return View();
        }

        //
        // GET: /About/
        public ActionResult About()
        {
            return View();
        }

        
        [HttpPost]
        public ActionResult Fight(FormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here to handle posting without javascript. Not... enough... time....

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

    }
}
