using System.Web;
using System.Web.Optimization;

namespace TweetFighter
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/all").Include(
                        "~/Scripts/knockout-{version}.js",
                        "~/Scripts/knockout.mapping-latest.js",
                        "~/Scripts/jquery.signalR-1.0.0-rc1.js",
                        "~/Scripts/jquery.flot.js",
                        "~/Scripts/jquery.flot.resize.js",
                        "~/Scripts/tweetFighter.js"
                        ));

            BundleTable.Bundles.Add(new StyleBundle("~/Content/site").Include("~/Content/site.css"));

            // Add @Styles.Render("~/Content/bootstrap") in the <head/> of your _Layout.cshtml view
            // Add @Scripts.Render("~/bundles/bootstrap") after jQuery in your _Layout.cshtml view
            // When <compilation debug="true" />, MVC4 will render the full readable version. When set to <compilation debug="false" />, the minified version will be rendered automatically
            BundleTable.Bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include("~/Scripts/bootstrap*"));
            BundleTable.Bundles.Add(new StyleBundle("~/Content/bootstrap").Include("~/Content/bootstrap.css", "~/Content/bootstrap-responsive.css"));
            
        }
    }
}