// Streamer.bot > Execute C# Code. Variables esperadas: %user%  y  eggType (roto|comun|pcomun|raro|epico|legendario)
using System;
using System.Net.Http;
using System.Text;

public class CPHInline
{
    public bool Execute()
    {
        string user = args["user"].ToString();
        string egg  = args["eggType"].ToString();
        using (var c = new HttpClient())
        {
            c.DefaultRequestHeaders.Add("X-Key", "TU_SECRET");
            var body = new StringContent("{\"user\":\"" + user + "\",\"egg\":\"" + egg + "\"}", Encoding.UTF8, "application/json");
            var r = c.PostAsync("https://TU-WORKER.TU-USUARIO.workers.dev/give", body).Result;
            CPH.LogInfo("Huevo -> " + r.StatusCode);
        }
        return true;
    }
}