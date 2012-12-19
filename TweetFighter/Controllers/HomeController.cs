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

        //
        // GET: /Home/Fight/termOne/termTwo

        public ActionResult Fight(string termOne, string termTwo)
        {
            return View();
        }

        [HttpPost]
        public ActionResult Fight(FormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

    }
}
